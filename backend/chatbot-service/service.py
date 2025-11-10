import os
import json
import pandas as pd
from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
import chromadb
from urllib.parse import urlparse

# ------------------ Load environment variables ------------------
load_dotenv()

# ------------------ OpenAI & RAG Setup ------------------
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in .env file.")
os.environ["OPENAI_API_KEY"] = api_key
client = OpenAI(api_key=api_key)

rag_llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)
embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")

# Chroma config (supports remote HttpClient or local PersistentClient)
collection_name = os.getenv("CHROMA_COLLECTION", "rag_docs")
chroma_url = os.getenv("CHROMA_URL")
chroma_host = os.getenv("CHROMA_HOST")
chroma_port = int(os.getenv("CHROMA_PORT", "8000"))
chroma_ssl = os.getenv("CHROMA_SSL", "false").lower() == "true"

if chroma_url:
    parsed = urlparse(chroma_url)
    host = parsed.hostname
    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    use_ssl = parsed.scheme == "https"
    chroma_client = chromadb.HttpClient(host=host, port=port, ssl=use_ssl)
elif chroma_host:
    chroma_client = chromadb.HttpClient(host=chroma_host, port=chroma_port, ssl=chroma_ssl)
else:
    chroma_path = os.getenv("CHROMA_PATH", "chroma_db")
    chroma_client = chromadb.PersistentClient(path=chroma_path)
vectorstore = Chroma(
    client=chroma_client,
    collection_name=collection_name,
    embedding_function=embedding_model,
)

# ------------------ Load PDF if vectorstore is empty ------------------
if chroma_client.get_or_create_collection(collection_name).count() == 0:
    print("Vector store is empty. Loading 'backend/chatbot-service/ServeXa.pdf'...")
    try:
        loader = PyPDFLoader("backend/chatbot-service/ServeXa.pdf")
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)
        splits = text_splitter.split_documents(docs)
        vectorstore.add_documents(splits)
        print("Documents loaded and vectorized.")
    except Exception as e:
        print(f"Error loading PDF: {e}. Ensure 'backend/chatbot-service/ServeXa.pdf' is in the same directory.")


retriever = vectorstore.as_retriever()
system_prompt = "You are an intelligent chatbot. Use the following context to answer the question. If you don't know, say you don't know.\n\n{context}"
prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}")
])
qa_chain = create_stuff_documents_chain(rag_llm, prompt)
rag_chain = create_retrieval_chain(retriever, qa_chain)

def invoke_rag_chain(question: str) -> str:
    try:
        response = rag_chain.invoke({"input": question})
        return response["answer"]
    except Exception as e:
        return f"Error processing RAG query: {str(e)}"

# ------------------ PostgreSQL Setup (Using .env) ------------------
def create_engine_safe(user, password, host, port, db_name, db_label):
    try:
        engine = create_engine(
            f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{db_name}",
            pool_pre_ping=True
        )
        with engine.connect() as conn:
            print(f"{db_label} DB connected successfully ✅")
        return engine
    except SQLAlchemyError as e:
        print(f"{db_label} DB connection error ❌: {e}")
        return None

engine_appointment = create_engine_safe(
    os.getenv("DB_APPOINTMENT_USER", "postgres"),
    os.getenv("DB_APPOINTMENT_PASSWORD", "postgres"),
    os.getenv("DB_APPOINTMENT_HOST", "localhost"),
    os.getenv("DB_APPOINTMENT_PORT", 5432),
    os.getenv("DB_APPOINTMENT_NAME", "servexa_appointment"),
    "Appointment"
)

engine_auth = create_engine_safe(
    os.getenv("DB_AUTH_USER", "postgres"),
    os.getenv("DB_AUTH_PASSWORD", "password"),
    os.getenv("DB_AUTH_HOST", "localhost"),
    os.getenv("DB_AUTH_PORT", 5432),
    os.getenv("DB_AUTH_NAME", "servexa_auth"),
    "Auth"
)

engine_vehicle = create_engine_safe(
    os.getenv("DB_VEHICLE_USER", "postgres"),
    os.getenv("DB_VEHICLE_PASSWORD", "root"),
    os.getenv("DB_VEHICLE_HOST", "localhost"),
    os.getenv("DB_VEHICLE_PORT", 5432),
    os.getenv("DB_VEHICLE_NAME", "servexa_vehicle_db"),
    "Vehicle"
)

# ------------------ SQL Execution ------------------
def execute_sql(query: str, db="appointment"):
    engine_map = {
        "appointment": engine_appointment,
        "auth": engine_auth,
        "vehicle": engine_vehicle
    }
    engine = engine_map.get(db)
    if not engine:
        return "Database connection is not configured."
    try:
        with engine.connect() as conn:
            result = conn.execute(text(query))
            rows = result.fetchall()
            columns = result.keys()
        return pd.DataFrame(rows, columns=columns)
    except SQLAlchemyError as e:
        print(f"SQL Execution Error: {e}")
        return f"Database Error: {e}"

# ------------------ Personal Data Handling ------------------
def get_user_info(customer_id: str, field: str):
    if not customer_id:
        return None
    try:
        query = f"SELECT {field} FROM users WHERE id = :uid"
        with engine_auth.connect() as conn:
            result = conn.execute(text(query), {"uid": customer_id})
            row = result.fetchone()
        return row[0] if row else None
    except SQLAlchemyError as e:
        print(f"Error fetching user info: {e}")
        return None

# ------------------ SQL Generation ------------------
few_shot_examples = """..."""  # Add few-shot SQL examples if you have them

def generate_sql(question: str, customer_id: int = None) -> str:
    customer_filter = f"AND c.customer_id = {customer_id}" if customer_id else ""
    prompt_text = f"""
You are an expert SQL generator for garage microservices.

Schemas, rules, and examples:
{few_shot_examples}

Q: {question}
SQL:
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt_text}],
        temperature=0.2
    )
    sql_query = response.choices[0].message.content.strip()
    return sql_query.replace("```sql", "").replace("```", "").strip()

def explain_results(question: str, df):
    if isinstance(df, str):
        return f"I couldn’t process your question: {df}"
    if df.empty:
        return "I couldn’t find any matching records for that question."

    total_rows = len(df)
    display_df = df.head(5)
    data_str = display_df.to_string(index=False)

    prompt_text = f"""
You are a helpful garage assistant. Write a concise, friendly answer in non-technical English.

User question: "{question}"
Total result rows: {total_rows}
Preview of data (up to 5 rows):
{data_str}

Guidelines: summarize key info like service type, status, date, employee, vehicle registration, customer name, costs. Use human-friendly terms and formats.
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt_text}],
        temperature=0.5
    )
    return response.choices[0].message.content.strip()

def invoke_sql_chain(question: str, customer_id: int = None, db="appointment") -> str:
    try:
        sql_query = generate_sql(question, customer_id)
        print(f"Generated SQL: {sql_query}")
        result_df = execute_sql(sql_query, db)
        return explain_results(question, result_df)
    except Exception as e:
        return f"Error processing SQL query: {str(e)}"

# ------------------ Routing & Tool Setup ------------------
tools = [
    {
        "type": "function",
        "function": {
            "name": "query_rag_system",
            "description": "Answers questions about ServeXa",
            "parameters": {"type": "object", "properties": {"question": {"type": "string"}}, "required": ["question"]}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "query_sql_system",
            "description": "Answers questions about garage operations.",
            "parameters": {"type": "object", "properties": {"question": {"type": "string"}}, "required": ["question"]}
        }
    }
]

def is_personal_data_request(question: str) -> bool:
    personal_keywords = [
        'appointment', 'booking', 'my car', 'my vehicle', 'my service',
        'vehicle details', 'car details', 'service status', 'my booking',
        'when is my', 'status of my', 'my vehicles', 'my appointments'
    ]
    question_lower = question.lower()
    return any(keyword in question_lower for keyword in personal_keywords)

def classify_and_route(question: str, customer_id: str = None) -> str:
    # ---------------- Personal Data Handling ----------------
    personal_keywords_name = ["my name", "who am i", "full name"]
    personal_keywords_email = ["my email", "email address"]
    personal_keywords_phone = ["my phone", "phone number"]

    if customer_id:
        q_lower = question.lower()
        if any(k in q_lower for k in personal_keywords_name):
            name = get_user_info(customer_id, "full_name")
            return f"Your name is {name}." if name else "I don't know your name."
        if any(k in q_lower for k in personal_keywords_email):
            email = get_user_info(customer_id, "email")
            return f"Your email is {email}." if email else "I don't know your email."
        if any(k in q_lower for k in personal_keywords_phone):
            phone = get_user_info(customer_id, "phone_number")
            return f"Your phone number is {phone}." if phone else "I don't know your phone number."

    # ---------------- Fallback Routing ----------------
    if is_personal_data_request(question) and not customer_id:
        return "Please log in to view your personal appointments, vehicles, or service status."

    system_prompt = """
You are a routing assistant. Call *one* of these:
- `query_rag_system` for ServeXa/general knowledge
- `query_sql_system` for garage/customer/vehicle/appointment/staff info
"""
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": question}
    ]

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini", messages=messages, tools=tools, tool_choice="auto"
        )
        response_message = response.choices[0].message
        tool_calls = getattr(response_message, "tool_calls", [])

        if tool_calls:
            tool_call = tool_calls[0]
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)

            if function_name == "query_rag_system":
                return invoke_rag_chain(function_args['question'])
            elif function_name == "query_sql_system":
                return invoke_sql_chain(function_args['question'], customer_id, db="appointment")
            else:
                return "Error: Unknown function call."

        return invoke_rag_chain(question)
    except Exception as e:
        return f"Routing error: {e}"
