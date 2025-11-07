import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateBCryptHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "admin";
        String hashedPassword = encoder.encode(password);
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hashedPassword);
        System.out.println();
        System.out.println("SQL Command:");
        System.out.println("INSERT INTO users (id, email, password, full_name, role, status, is_email_verified, is_active, created_at, updated_at) VALUES (gen_random_uuid(), 'admin123@gmail.com', '" + hashedPassword + "', 'Admin', 'ADMIN', 'APPROVED', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);");
    }
}