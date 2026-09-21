package com.logifleet.maintenance_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.logifleet.maintenance_service.dto.VehicleResponse;

@FeignClient(name = "vehicle-service")
public interface VehicleClient {

    @GetMapping("/api/vehicles/{id}")
    VehicleResponse getVehicleById(@PathVariable Long id);

    @PutMapping("/api/vehicles/{id}/status")
    VehicleResponse updateVehicleStatus(
            @PathVariable Long id,
            @RequestParam String status);
}