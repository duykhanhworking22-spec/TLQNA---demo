package com.hoidap.hoidapdemo.controller.api.user;

import com.hoidap.hoidapdemo.service.UserServiceImpl;
import com.hoidap.hoidapdemo.dto.common.ApiResponse;
import com.hoidap.hoidapdemo.dto.user.UserProfileResponse;
import com.hoidap.hoidapdemo.utils.AppStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Quáº£n LÃ½ NgÆ°á»i DÃ¹ng", description = "CÃ¡c API liÃªn quan Ä‘áº¿n thÃ´ng tin cÃ¡ nhÃ¢n")
public class UserController {

    private final UserServiceImpl userService;

    public UserController(UserServiceImpl userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Xem thÃ´ng tin cÃ¡ nhÃ¢n", description = "Dá»±a vÃ o Token Ä‘Äƒng nháº­p Ä‘á»ƒ tráº£ vá» thÃ´ng tin chi tiáº¿t cá»§a Sinh viÃªn hoáº·c CVHT")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile(Authentication authentication) {
        String email = authentication.getName();

        UserProfileResponse profile = userService.getMyProfile(email);

        return ResponseEntity.ok(ApiResponse.<UserProfileResponse>builder()
                .status(AppStatus.SUCCESS.getCode())
                .message("Láº¥y thÃ´ng tin thÃ nh cÃ´ng")
                .data(profile)
                .build());
    }
}

