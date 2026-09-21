package com.logifleet.maintenance_service.controller;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.logifleet.maintenance_service.entity.Maintenance;
import com.logifleet.maintenance_service.service.MaintenanceService;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    // Get all maintenance records
    @GetMapping
    public List<Maintenance> getAllMaintenanceRecords() {
        return maintenanceService.getAllMaintenanceRecords();
    }

    // Get maintenance record by ID
    @GetMapping("/{id}")
    public ResponseEntity<Maintenance> getMaintenanceById(
            @PathVariable Long id) {

        Maintenance maintenance =
                maintenanceService.getMaintenanceById(id);

        if (maintenance == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(maintenance);
    }

    // Get all maintenance records for a specific vehicle (history)
    @GetMapping("/vehicle/{vehicleId}")
    public List<Maintenance> getMaintenanceByVehicleId(
            @PathVariable Long vehicleId) {

        return maintenanceService.getMaintenanceByVehicleId(vehicleId);
    }

    // Create a new maintenance record
    // This automatically sets the vehicle status to UNDER_MAINTENANCE
    @PostMapping
    public ResponseEntity<?> createMaintenance(
            @Valid @RequestBody Maintenance maintenance) {

        try {
            Maintenance saved =
                    maintenanceService.createMaintenance(maintenance);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Update an existing maintenance record
    @PutMapping("/{id}")
    public ResponseEntity<Maintenance> updateMaintenance(
            @PathVariable Long id,
            @Valid @RequestBody Maintenance maintenance) {

        Maintenance updatedMaintenance =
                maintenanceService.updateMaintenance(id, maintenance);

        if (updatedMaintenance == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedMaintenance);
    }

    // Complete maintenance — sets status=COMPLETED and vehicle back to AVAILABLE
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeMaintenance(@PathVariable Long id) {

        Maintenance completed =
                maintenanceService.completeMaintenance(id);

        if (completed == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(completed);
    }

    // Delete a maintenance record
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaintenance(
            @PathVariable Long id) {

        maintenanceService.deleteMaintenance(id);

        return ResponseEntity.noContent().build();
    }
}