package com.logifleet.maintenance_service.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.logifleet.maintenance_service.client.VehicleClient;
import com.logifleet.maintenance_service.dto.VehicleResponse;
import com.logifleet.maintenance_service.entity.Maintenance;
import com.logifleet.maintenance_service.repository.MaintenanceRepository;

@Service
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final VehicleClient vehicleClient;

    public MaintenanceService(
            MaintenanceRepository maintenanceRepository,
            VehicleClient vehicleClient) {

        this.maintenanceRepository = maintenanceRepository;
        this.vehicleClient = vehicleClient;
    }

    public List<Maintenance> getAllMaintenanceRecords() {
        return maintenanceRepository.findAll();
    }

    public Maintenance getMaintenanceById(Long id) {
        return maintenanceRepository.findById(id).orElse(null);
    }

    // Returns all maintenance records for a specific vehicle (history)
    public List<Maintenance> getMaintenanceByVehicleId(Long vehicleId) {
        return maintenanceRepository.findByVehicleId(vehicleId);
    }

    public Maintenance createMaintenance(Maintenance maintenance) {

        // Check whether the vehicle exists
        VehicleResponse vehicle =
                vehicleClient.getVehicleById(maintenance.getVehicleId());

        if (vehicle == null) {
            throw new RuntimeException("Vehicle not found with id: "
                    + maintenance.getVehicleId());
        }

        // Vehicle must NOT already be under maintenance
        if ("UNDER_MAINTENANCE".equalsIgnoreCase(vehicle.getStatus())) {
            throw new RuntimeException(
                    "Vehicle is already under maintenance");
        }

        // Vehicle must NOT be on a trip — cannot schedule maintenance
        // while vehicle is in use
        if ("ON_TRIP".equalsIgnoreCase(vehicle.getStatus())) {
            throw new RuntimeException(
                    "Cannot schedule maintenance: vehicle is currently ON_TRIP");
        }

        // Save the maintenance record
        Maintenance saved = maintenanceRepository.save(maintenance);

        // Automatically set vehicle status to UNDER_MAINTENANCE via Feign
        vehicleClient.updateVehicleStatus(
                maintenance.getVehicleId(), "UNDER_MAINTENANCE");

        return saved;
    }

    public Maintenance updateMaintenance(
            Long id,
            Maintenance maintenance) {

        Maintenance existingMaintenance =
                maintenanceRepository.findById(id).orElse(null);

        if (existingMaintenance == null) {
            return null;
        }

        existingMaintenance.setVehicleId(maintenance.getVehicleId());
        existingMaintenance.setMaintenanceType(
                maintenance.getMaintenanceType());
        existingMaintenance.setDescription(
                maintenance.getDescription());
        existingMaintenance.setScheduledDate(
                maintenance.getScheduledDate());
        existingMaintenance.setCompletedDate(
                maintenance.getCompletedDate());
        existingMaintenance.setStatus(
                maintenance.getStatus());
        existingMaintenance.setCost(
                maintenance.getCost());

        return maintenanceRepository.save(existingMaintenance);
    }

    // Dedicated complete operation — sets completedDate, status, and
    // updates the vehicle back to AVAILABLE via Feign
    public Maintenance completeMaintenance(Long id) {

        Maintenance existing =
                maintenanceRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setStatus("COMPLETED");
        existing.setCompletedDate(LocalDate.now());

        Maintenance saved = maintenanceRepository.save(existing);

        // Set vehicle back to AVAILABLE via Feign
        vehicleClient.updateVehicleStatus(
                existing.getVehicleId(), "AVAILABLE");

        return saved;
    }

    public void deleteMaintenance(Long id) {
        maintenanceRepository.deleteById(id);
    }
}