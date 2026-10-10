package com.example.smarttimetable.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final AuthEntryPointJwt unauthorizedHandler;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(CustomUserDetailsService userDetailsService,
                          AuthEntryPointJwt unauthorizedHandler,
                          CustomAccessDeniedHandler accessDeniedHandler,
                          JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.userDetailsService = userDetailsService;
        this.unauthorizedHandler = unauthorizedHandler;
        this.accessDeniedHandler = accessDeniedHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(unauthorizedHandler)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/health").permitAll()

                        // Operational endpoints accessible by both ADMIN and FACULTY
                        .requestMatchers("/api/dashboard/**").hasAnyRole("ADMIN", "FACULTY")
                        .requestMatchers("/api/faculty/**").hasAnyRole("ADMIN", "FACULTY")
                        .requestMatchers("/api/reports/**").hasAnyRole("ADMIN", "FACULTY")
                        .requestMatchers("/api/timetable-entries/**").hasAnyRole("ADMIN", "FACULTY")
                        .requestMatchers("/api/live-classes/**").hasAnyRole("ADMIN", "FACULTY")
                        .requestMatchers("/api/meetings/**").hasAnyRole("ADMIN", "FACULTY")
                        .requestMatchers("/api/notifications/**").hasAnyRole("ADMIN", "FACULTY")
                        .requestMatchers(HttpMethod.GET, "/api/faculties/**").hasAnyRole("ADMIN", "FACULTY")
                        .requestMatchers(HttpMethod.GET, "/api/timetables/**").hasAnyRole("ADMIN", "FACULTY")
                        .requestMatchers(HttpMethod.GET, "/api/subjects/**").hasAnyRole("ADMIN", "FACULTY")
                        .requestMatchers(HttpMethod.GET, "/api/rooms/**").hasAnyRole("ADMIN", "FACULTY")
                        .requestMatchers(HttpMethod.GET, "/api/sections/**").hasAnyRole("ADMIN", "FACULTY")
                        .requestMatchers(HttpMethod.GET, "/api/semesters/**").hasAnyRole("ADMIN", "FACULTY")
                        .requestMatchers(HttpMethod.GET, "/api/academic-years/**").hasAnyRole("ADMIN", "FACULTY")
                        .requestMatchers(HttpMethod.GET, "/api/departments/**").hasAnyRole("ADMIN", "FACULTY")
                        .requestMatchers(HttpMethod.GET, "/api/time-slots/**").hasAnyRole("ADMIN", "FACULTY")
                        .requestMatchers(HttpMethod.GET, "/api/users/**").hasAnyRole("ADMIN", "FACULTY")

                        // Admin-exclusive management endpoints (POST, PUT, DELETE, and admin-only modules)
                        .requestMatchers(HttpMethod.POST, "/api/departments/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/departments/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/departments/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/academic-years/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/academic-years/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/academic-years/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/academic-years/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/semesters/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/semesters/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/semesters/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/sections/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/sections/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/sections/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/subjects/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/subjects/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/subjects/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/rooms/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/rooms/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/rooms/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/time-slots/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/time-slots/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/time-slots/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/faculties/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/faculties/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/faculties/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/timetables/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/timetables/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/timetables/**").hasRole("ADMIN")

                        .requestMatchers("/api/upload-history/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
