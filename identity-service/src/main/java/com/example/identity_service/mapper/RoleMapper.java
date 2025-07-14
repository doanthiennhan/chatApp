package com.example.identity_service.mapper;


import com.example.identity_service.dto.response.RoleResponse;
import com.example.identity_service.enums.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    RoleResponse toRoleResponse(Role role);
}
