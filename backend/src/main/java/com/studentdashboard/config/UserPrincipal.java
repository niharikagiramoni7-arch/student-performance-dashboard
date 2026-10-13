package com.studentdashboard.config;

import com.studentdashboard.entity.User;
import com.studentdashboard.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@AllArgsConstructor
@Getter
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final String fullName;
    private final String role;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean enabled;

    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities;
        if (user.getRole() == com.studentdashboard.entity.Role.ROLE_ADMIN) {
            authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_ADMIN"),
                    new SimpleGrantedAuthority("ROLE_FACULTY"),
                    new SimpleGrantedAuthority("ROLE_STUDENT")
            );
        } else {
            authorities = List.of(new SimpleGrantedAuthority(user.getRole().name()));
        }
        boolean isEnabled = user.getStatus() == UserStatus.ACTIVE;

        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getFullName(),
                user.getRole().name(),
                authorities,
                isEnabled
        );
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
