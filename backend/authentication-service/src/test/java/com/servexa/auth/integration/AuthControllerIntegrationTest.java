package com.servexa.auth.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.servexa.auth.dto.*;
import com.servexa.auth.entity.User;
import com.servexa.auth.repository.UserRepository;
import com.servexa.auth.util.TestDataBuilder;
import com.servexa.common.enums.UserRole;
import com.servexa.common.enums.UserStatus;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("AuthController Integration Tests")
class AuthControllerIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        private static String accessToken;
        private static String refreshToken;
        private static String userId;

        @BeforeEach
        void setUp() {
                // Clean database before each test
                userRepository.deleteAll();
        }

        @Test
        @Order(1)
        @DisplayName("Should complete full authentication flow - Signup, Login, Get Profile, Update Profile")
        void fullAuthenticationFlow_ShouldWork() throws Exception {
                // Step 1: Signup
                SignupRequest signupRequest = TestDataBuilder.createSignupRequest("integration@test.com",
                                UserRole.CUSTOMER);

                MvcResult signupResult = mockMvc.perform(post("/api/auth/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(signupRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.email").value("integration@test.com"))
                                .andExpect(jsonPath("$.data.role").value("CUSTOMER"))
                                .andExpect(jsonPath("$.data.status").value("APPROVED"))
                                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                                .andReturn();

                AuthResponse signupResponse = objectMapper.readValue(
                                objectMapper.readTree(signupResult.getResponse().getContentAsString()).get("data")
                                                .toString(),
                                AuthResponse.class);
                accessToken = signupResponse.getAccessToken();
                refreshToken = signupResponse.getRefreshToken();
                userId = signupResponse.getUserId();

                // Verify user was created in database
                User createdUser = userRepository.findByEmail("integration@test.com").orElseThrow();
                assertThat(createdUser).isNotNull();
                assertThat(createdUser.getRole()).isEqualTo(UserRole.CUSTOMER);
                assertThat(createdUser.getStatus()).isEqualTo(UserStatus.APPROVED);

                // Step 2: Login with same credentials
                LoginRequest loginRequest = new LoginRequest();
                loginRequest.setEmail("integration@test.com");
                loginRequest.setPassword("Password@123");

                MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(loginRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.email").value("integration@test.com"))
                                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                                .andReturn();

                AuthResponse loginResponse = objectMapper.readValue(
                                objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("data")
                                                .toString(),
                                AuthResponse.class);

                // Step 3: Get current user profile
                mockMvc.perform(get("/api/auth/me")
                                .header("Authorization", "Bearer " + loginResponse.getAccessToken()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.email").value("integration@test.com"))
                                .andExpect(jsonPath("$.data.userId").value(userId));

                // Step 4: Update profile
                UpdateProfileRequest updateRequest = new UpdateProfileRequest();
                updateRequest.setFullName("Updated Integration User");
                updateRequest.setPhoneNumber("+9876543210");
                updateRequest.setAddress("999 Integration Ave");

                mockMvc.perform(put("/api/auth/profile")
                                .header("Authorization", "Bearer " + loginResponse.getAccessToken())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.fullName").value("Updated Integration User"))
                                .andExpect(jsonPath("$.data.phoneNumber").value("+9876543210"))
                                .andExpect(jsonPath("$.data.address").value("999 Integration Ave"));

                // Verify profile was updated in database
                User updatedUser = userRepository.findById(userId).orElseThrow();
                assertThat(updatedUser.getFullName()).isEqualTo("Updated Integration User");
                assertThat(updatedUser.getPhoneNumber()).isEqualTo("+9876543210");
        }

        @Test
        @Order(2)
        @DisplayName("Should handle admin/employee signup with pending status")
        void signupAdminEmployee_ShouldBePending() throws Exception {
                // Test Admin signup
                SignupRequest adminRequest = TestDataBuilder.createSignupRequest("admin@test.com", UserRole.ADMIN);

                mockMvc.perform(post("/api/auth/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(adminRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.status").value("PENDING"))
                                .andExpect(jsonPath("$.data.accessToken").doesNotExist())
                                .andExpect(jsonPath("$.data.refreshToken").doesNotExist());

                // Test Employee signup
                SignupRequest employeeRequest = TestDataBuilder.createSignupRequest("employee@test.com",
                                UserRole.EMPLOYEE);

                mockMvc.perform(post("/api/auth/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(employeeRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.status").value("PENDING"))
                                .andExpect(jsonPath("$.data.accessToken").doesNotExist());

                // Verify pending users cannot login
                LoginRequest loginRequest = new LoginRequest();
                loginRequest.setEmail("admin@test.com");
                loginRequest.setPassword("Password@123");

                mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(loginRequest)))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message")
                                                .value("Your account is pending approval from an administrator"));
        }

        @Test
        @Order(3)
        @DisplayName("Should handle token refresh flow")
        void tokenRefresh_ShouldGenerateNewTokens() throws Exception {
                // First create a user and login
                SignupRequest signupRequest = TestDataBuilder.createSignupRequest("refresh@test.com",
                                UserRole.CUSTOMER);

                MvcResult signupResult = mockMvc.perform(post("/api/auth/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(signupRequest)))
                                .andExpect(status().isOk())
                                .andReturn();

                AuthResponse signupResponse = objectMapper.readValue(
                                objectMapper.readTree(signupResult.getResponse().getContentAsString()).get("data")
                                                .toString(),
                                AuthResponse.class);

                String oldAccessToken = signupResponse.getAccessToken();
                String oldRefreshToken = signupResponse.getRefreshToken();

                // Refresh the token
                RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
                refreshRequest.setRefreshToken(oldRefreshToken);

                MvcResult refreshResult = mockMvc.perform(post("/api/auth/refresh")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(refreshRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                                .andReturn();

                AuthResponse refreshResponse = objectMapper.readValue(
                                objectMapper.readTree(refreshResult.getResponse().getContentAsString()).get("data")
                                                .toString(),
                                AuthResponse.class);

                // New tokens should be different
                assertThat(refreshResponse.getAccessToken()).isNotEqualTo(oldAccessToken);
                assertThat(refreshResponse.getRefreshToken()).isNotEqualTo(oldRefreshToken);

                // Old refresh token should no longer work
                mockMvc.perform(post("/api/auth/refresh")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(refreshRequest)))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @Order(4)
        @DisplayName("Should handle profile picture update")
        void updateProfilePicture_ShouldWork() throws Exception {
                // Create a user first
                SignupRequest signupRequest = TestDataBuilder.createSignupRequest("picture@test.com",
                                UserRole.CUSTOMER);

                MvcResult signupResult = mockMvc.perform(post("/api/auth/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(signupRequest)))
                                .andExpect(status().isOk())
                                .andReturn();

                AuthResponse signupResponse = objectMapper.readValue(
                                objectMapper.readTree(signupResult.getResponse().getContentAsString()).get("data")
                                                .toString(),
                                AuthResponse.class);

                // Update profile picture
                UpdateProfilePictureRequest pictureRequest = new UpdateProfilePictureRequest();
                pictureRequest.setImageUrl("https://example.com/new-profile-pic.jpg");

                mockMvc.perform(put("/api/auth/users/{userId}/profile-picture", signupResponse.getUserId())
                                .header("Authorization", "Bearer " + signupResponse.getAccessToken())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(pictureRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.imageUrl")
                                                .value("https://example.com/new-profile-pic.jpg"));

                // Verify in database
                User user = userRepository.findById(signupResponse.getUserId()).orElseThrow();
                assertThat(user.getImageUrl()).isEqualTo("https://example.com/new-profile-pic.jpg");
        }

        @Test
        @Order(5)
        @DisplayName("Should handle logout flow")
        void logout_ShouldClearRefreshToken() throws Exception {
                // Create and login a user
                SignupRequest signupRequest = TestDataBuilder.createSignupRequest("logout@test.com", UserRole.CUSTOMER);

                MvcResult signupResult = mockMvc.perform(post("/api/auth/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(signupRequest)))
                                .andExpect(status().isOk())
                                .andReturn();

                AuthResponse signupResponse = objectMapper.readValue(
                                objectMapper.readTree(signupResult.getResponse().getContentAsString()).get("data")
                                                .toString(),
                                AuthResponse.class);

                // Logout
                mockMvc.perform(post("/api/auth/logout")
                                .param("userId", signupResponse.getUserId()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));

                // Verify refresh token is cleared
                User user = userRepository.findById(signupResponse.getUserId()).orElseThrow();
                assertThat(user.getRefreshToken()).isNull();

                // Old refresh token should not work
                RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
                refreshRequest.setRefreshToken(signupResponse.getRefreshToken());

                mockMvc.perform(post("/api/auth/refresh")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(refreshRequest)))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        @Order(6)
        @DisplayName("Should validate security - prevent cross-user operations")
        void security_ShouldPreventCrossUserOperations() throws Exception {
                // Create two users
                SignupRequest user1Request = TestDataBuilder.createSignupRequest("user1@test.com", UserRole.CUSTOMER);
                SignupRequest user2Request = TestDataBuilder.createSignupRequest("user2@test.com", UserRole.CUSTOMER);

                MvcResult user1Result = mockMvc.perform(post("/api/auth/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(user1Request)))
                                .andExpect(status().isOk())
                                .andReturn();

                MvcResult user2Result = mockMvc.perform(post("/api/auth/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(user2Request)))
                                .andExpect(status().isOk())
                                .andReturn();

                AuthResponse user1Response = objectMapper.readValue(
                                objectMapper.readTree(user1Result.getResponse().getContentAsString()).get("data")
                                                .toString(),
                                AuthResponse.class);

                AuthResponse user2Response = objectMapper.readValue(
                                objectMapper.readTree(user2Result.getResponse().getContentAsString()).get("data")
                                                .toString(),
                                AuthResponse.class);

                // User1 should not be able to update User2's profile picture
                UpdateProfilePictureRequest pictureRequest = new UpdateProfilePictureRequest();
                pictureRequest.setImageUrl("https://example.com/hacked.jpg");

                mockMvc.perform(put("/api/auth/users/{userId}/profile-picture", user2Response.getUserId())
                                .header("Authorization", "Bearer " + user1Response.getAccessToken())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(pictureRequest)))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").value("Cannot update another user's profile picture"));
        }

        @Test
        @Order(7)
        @DisplayName("Should handle validation errors")
        void validation_ShouldReturnBadRequest() throws Exception {
                // Test empty email
                SignupRequest invalidRequest = new SignupRequest();
                invalidRequest.setFullName("Test User");
                invalidRequest.setPassword("Password@123");
                invalidRequest.setRole(UserRole.CUSTOMER);

                mockMvc.perform(post("/api/auth/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalidRequest)))
                                .andExpect(status().isBadRequest());

                // Test duplicate email
                SignupRequest validRequest = TestDataBuilder.createSignupRequest("duplicate@test.com",
                                UserRole.CUSTOMER);

                // First signup should succeed
                mockMvc.perform(post("/api/auth/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(validRequest)))
                                .andExpect(status().isOk());

                // Second signup with same email should fail
                mockMvc.perform(post("/api/auth/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(validRequest)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").exists());
        }
}