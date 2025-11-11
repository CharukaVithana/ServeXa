import os
import json
import asyncio
from typing import Optional
from dotenv import load_dotenv
from openai import OpenAI
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
import chromadb
from urllib.parse import urlparse
from service_clients import service_clients
import logging

# ------------------ Load environment variables ------------------
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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
    print("Vector store is empty. Loading 'ServeXa.pdf'...")
    try:
        # Get the directory where this script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        pdf_path = os.path.join(script_dir, "ServeXa.pdf")
        
        if not os.path.exists(pdf_path):
            print(f"PDF not found at {pdf_path}")
            # Try alternate path from root
            alt_path = "backend/chatbot-service/ServeXa.pdf"
            if os.path.exists(alt_path):
                pdf_path = alt_path
        
        loader = PyPDFLoader(pdf_path)
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)
        splits = text_splitter.split_documents(docs)
        vectorstore.add_documents(splits)
        print(f"Documents loaded and vectorized from {pdf_path}")
    except Exception as e:
        print(f"Error loading PDF: {e}")


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

# ------------------ Service-based Data Handling ------------------
async def get_user_info(customer_id: str, field: str, token: Optional[str] = None):
    """Get user information from auth service"""
    if not customer_id:
        return None
    try:
        user_info = await service_clients.auth.get_user_info(customer_id, token)
        
        # Check if user_info is None or empty
        if not user_info:
            logger.warning("No user info returned from auth service")
            return None
            
        # Auth service returns response in format: {success: bool, data: {...}, message: str}
        if isinstance(user_info, dict):
            # Get data from "data" field
            user_data = user_info.get("data")
            
            # Check if data is None (no authenticated user)
            if user_data is None:
                logger.info("No authenticated user data available")
                return None
                
            # Ensure user_data is a dict
            if not isinstance(user_data, dict):
                logger.warning(f"user_data is not a dict: {type(user_data)}")
                return None
        else:
            logger.error(f"Unexpected user_info type: {type(user_info)}")
            return None
        
        # Map field names to response fields
        field_mapping = {
            "full_name": "fullName",
            "email": "email",
            "phone_number": "phoneNumber"
        }
        
        response_field = field_mapping.get(field, field)
        result = user_data.get(response_field)
        
        # Log for debugging
        logger.info(f"User info field '{field}' -> '{response_field}': {result}")
        
        return result
    except Exception as e:
        logger.error(f"Error fetching user info: {e}")
        return None

# ------------------ Service Query Generation ------------------
async def query_microservices(question: str, customer_id: Optional[str] = None, token: Optional[str] = None) -> str:
    """Query microservices based on the question"""
    question_lower = question.lower()
    
    try:
        # Appointment-related queries
        if any(keyword in question_lower for keyword in ['appointment', 'booking', 'scheduled', 'service']):
            if customer_id:
                try:
                    appointments = await service_clients.appointment.get_customer_appointments(
                        customer_id, token
                    )
                    if appointments:
                        return format_appointments_response(question, appointments)
                    else:
                        return "You don't have any appointments currently."
                except Exception as e:
                    logger.error(f"Error fetching appointments: {e}")
                    return "I'm having trouble accessing appointment information right now. Please try again later."
            else:
                # Get general statistics
                stats = await service_clients.appointment.get_appointment_statistics(token)
                return format_appointment_stats(stats)
        
        # Vehicle-related queries
        elif any(keyword in question_lower for keyword in ['vehicle', 'car', 'registration']):
            if customer_id:
                try:
                    vehicles = await service_clients.vehicle.get_customer_vehicles(customer_id, token)
                    if vehicles:
                        return format_vehicles_response(question, vehicles)
                    else:
                        return "You don't have any vehicles registered."
                except Exception as e:
                    logger.error(f"Error fetching vehicles: {e}")
                    return "I'm having trouble accessing vehicle information right now. Please try again later."
            else:
                return "Please log in to view vehicle information."
        
        # Notification-related queries
        elif any(keyword in question_lower for keyword in ['notification', 'alert', 'message']):
            if customer_id:
                if 'unread' in question_lower:
                    count = await service_clients.notification.get_unread_count(customer_id, token)
                    return f"You have {count} unread notifications."
                else:
                    notifications = await service_clients.notification.get_user_notifications(
                        customer_id, token
                    )
                    return format_notifications_response(notifications)
            else:
                return "Please log in to view your notifications."
        
        else:
            return "I'm not sure how to answer that question. Please try asking about appointments, vehicles, or notifications."
            
    except Exception as e:
        logger.error(f"Error querying microservices: {e}")
        return f"I encountered an error while fetching your information. Please try again later."

def format_appointments_response(question: str, appointments: list) -> str:
    """Format appointment data into a friendly response"""
    if not appointments:
        return "No appointments found."
    
    total = len(appointments)
    
    # Sort appointments by date (most recent/upcoming first)
    sorted_appointments = sorted(appointments, 
                               key=lambda x: x.get('bookingDateTime', ''), 
                               reverse=False)
    
    # Separate by status
    scheduled = [a for a in sorted_appointments if a.get('status') == 'SCHEDULED']
    completed = [a for a in sorted_appointments if a.get('status') == 'COMPLETED']
    cancelled = [a for a in sorted_appointments if a.get('status') == 'CANCELLED']
    
    response_lines = [f"You have **{total}** total appointments:"]
    
    # Show scheduled appointments first
    if scheduled:
        response_lines.append(f"\n**Upcoming ({len(scheduled)}):** [View All Appointments →](/customer/profile/appointments)")
        for i, apt in enumerate(scheduled[:5], 1):  # Show first 5
            # Parse bookingDateTime to format date and time nicely
            booking_dt = apt.get('bookingDateTime', '')
            if booking_dt:
                try:
                    from datetime import datetime
                    dt = datetime.fromisoformat(booking_dt.replace('Z', '+00:00'))
                    date_str = dt.strftime('%Y-%m-%d')
                    time_str = dt.strftime('%H:%M')
                except:
                    date_str = 'N/A'
                    time_str = 'N/A'
            else:
                date_str = 'N/A'
                time_str = 'N/A'
                
            response_lines.append(
                f"{i}. {apt.get('serviceType', 'Service')} - "
                f"{date_str} at {time_str}"
            )
            if apt.get('mechanicName'):
                response_lines[-1] += f" with {apt.get('mechanicName')}"
    
    # Show completed appointments
    if completed and len(response_lines) < 10:  # Limit total response length
        response_lines.append(f"\n**Completed ({len(completed)}):** [View Service History →](/customer/profile/service-history)")
        for i, apt in enumerate(completed[:3], 1):  # Show first 3
            # Parse bookingDateTime to format date and time nicely
            booking_dt = apt.get('bookingDateTime', '')
            if booking_dt:
                try:
                    from datetime import datetime
                    dt = datetime.fromisoformat(booking_dt.replace('Z', '+00:00'))
                    date_str = dt.strftime('%Y-%m-%d')
                    time_str = dt.strftime('%H:%M')
                except:
                    date_str = 'N/A'
                    time_str = 'N/A'
            else:
                date_str = 'N/A'
                time_str = 'N/A'
                
            response_lines.append(
                f"{i}. {apt.get('serviceType', 'Service')} - "
                f"{date_str} at {time_str}"
            )
    
    # Show cancelled count if any
    if cancelled:
        response_lines.append(f"\n**Cancelled: {len(cancelled)}**")
    
    # Add helpful links at the bottom
    response_lines.append("\n---")
    response_lines.append("[Book New Appointment](/cus-dashboard/appointments) | [View All Appointments](/customer/profile/appointments) | [Service History](/customer/profile/service-history)")
    
    return "\n".join(response_lines)

def format_vehicles_response(question: str, vehicles: list) -> str:
    """Format vehicle data into a friendly response"""
    if not vehicles:
        return "No vehicles found."
    
    if len(vehicles) == 1:
        vehicle = vehicles[0]
        return f"You have 1 vehicle registered: {vehicle.get('year', '')} {vehicle.get('make', '')} {vehicle.get('model', '')}, Registration: {vehicle.get('registrationNumber', 'N/A')}."
    else:
        vehicle_list = []
        for v in vehicles[:3]:  # Show first 3
            vehicle_list.append(f"{v.get('year', '')} {v.get('make', '')} {v.get('model', '')}")
        return f"You have {len(vehicles)} vehicles registered: {', '.join(vehicle_list)}."

def format_notifications_response(notifications: list) -> str:
    """Format notifications into a friendly response"""
    if not notifications:
        return "You have no notifications."
    
    unread = [n for n in notifications if n.get('status') == 'UNREAD']
    if unread:
        return f"You have {len(notifications)} notifications, {len(unread)} unread."
    else:
        return f"You have {len(notifications)} notifications, all read."

def format_appointment_stats(stats: dict) -> str:
    """Format appointment statistics"""
    data = stats.get('data', {})
    total = data.get('totalAppointments', 0)
    scheduled = data.get('scheduledAppointments', 0)
    completed = data.get('completedAppointments', 0)
    
    return f"ServeXa has {total} total appointments: {scheduled} scheduled, {completed} completed."

# ------------------ Routing & Tool Setup ------------------
tools = [
    {
        "type": "function",
        "function": {
            "name": "query_rag_system",
            "description": "Answers questions about ServeXa services, policies, and general information",
            "parameters": {"type": "object", "properties": {"question": {"type": "string"}}, "required": ["question"]}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "query_service_system",
            "description": "Answers questions about garage operations, appointments, vehicles, and user-specific data",
            "parameters": {"type": "object", "properties": {"question": {"type": "string"}}, "required": ["question"]}
        }
    }
]

def is_personal_data_request(question: str) -> bool:
    personal_keywords = [
        'appointment', 'booking', 'my car', 'my vehicle', 'my service',
        'vehicle details', 'car details', 'service status', 'my booking',
        'when is my', 'status of my', 'my vehicles', 'my appointments',
        'notification', 'alert', 'message'
    ]
    question_lower = question.lower()
    return any(keyword in question_lower for keyword in personal_keywords)

async def classify_and_route_async(question: str, customer_id: str = None, token: str = None) -> str:
    # ---------------- Personal Data Handling ----------------
    personal_keywords_name = ["my name", "who am i", "full name"]
    personal_keywords_email = ["my email", "email address"]
    personal_keywords_phone = ["my phone", "phone number"]
    
    if customer_id:
        q_lower = question.lower()
        if any(k in q_lower for k in personal_keywords_name):
            logger.info(f"Fetching name for customer_id: {customer_id}, with token: {token[:20] if token else 'None'}...")
            name = await get_user_info(customer_id, "full_name", token)
            return f"Your name is {name}." if name else "I don't know your name."
        if any(k in q_lower for k in personal_keywords_email):
            email = await get_user_info(customer_id, "email", token)
            return f"Your email is {email}." if email else "I don't know your email."
        if any(k in q_lower for k in personal_keywords_phone):
            phone = await get_user_info(customer_id, "phone_number", token)
            return f"Your phone number is {phone}." if phone else "I don't know your phone number."
    
    # ---------------- Fallback Routing ----------------
    if is_personal_data_request(question) and not customer_id:
        return "Please log in to view your personal appointments, vehicles, or service status."
    
    system_prompt = """
You are a routing assistant. Call *one* of these:
- `query_rag_system` for ServeXa/general knowledge/policies
- `query_service_system` for garage/customer/vehicle/appointment/notification info
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
            elif function_name == "query_service_system":
                return await query_microservices(function_args['question'], customer_id, token)
            else:
                return "Error: Unknown function call."
        
        return invoke_rag_chain(question)
    except Exception as e:
        return f"Routing error: {e}"

# Wrapper function for backwards compatibility
def classify_and_route(question: str, customer_id: str = None) -> str:
    """Synchronous wrapper for the async classify_and_route function"""
    # For now, we'll run without auth token - in production, this should be passed
    return asyncio.run(classify_and_route_async(question, customer_id, None))