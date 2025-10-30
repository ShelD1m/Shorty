package com.dmitry.shorty.user;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
    @Column(nullable=false, unique=true) String email;
    @Column(nullable=false, name="password_hash") String passwordHash;

    @Column(nullable=false, name="email_verified") boolean emailVerified = false;

    @Column(nullable=false) String role = "USER";
    @Column(nullable=false, name="created_at") Instant createdAt = Instant.now();

    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getEmail(){return email;} public void setEmail(String e){this.email=e;}
    public String getPasswordHash(){return passwordHash;} public void setPasswordHash(String p){this.passwordHash=p;}
    public boolean isEmailVerified(){return emailVerified;} public void setEmailVerified(boolean v){this.emailVerified=v;}
    public String getRole(){return role;} public void setRole(String r){this.role=r;}
    public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant t){this.createdAt=t;}
}
