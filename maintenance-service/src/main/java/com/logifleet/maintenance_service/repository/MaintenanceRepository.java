package com.logifleet.maintenance_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.logifleet.maintenance_service.entity.Maintenance;

public interface MaintenanceRepository
        extends JpaRepository<Maintenance, Long> {

    // Query maintenance history for a specific vehicle
    List<Maintenance> findByVehicleId(Long vehicleId);
}