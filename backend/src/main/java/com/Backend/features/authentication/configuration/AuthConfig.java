package com.Backend.features.authentication.configuration;

import com.Backend.features.authentication.filter.AuthFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AuthConfig {
    @Bean
    public FilterRegistrationBean<AuthFilter> customAuthenticationFilter(AuthFilter filter) {
        FilterRegistrationBean<AuthFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(filter);
        registrationBean.addUrlPatterns("/api/*");
        return registrationBean;
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
