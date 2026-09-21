package com.logifleet.vehicle_service.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.logifleet.vehicle_service.entity.Vehicle;
import com.logifleet.vehicle_service.repository.VehicleRepository;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id).orElse(null);
    }

    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Long id, Vehicle vehicle) {

        Vehicle existingVehicle =
                vehicleRepository.findById(id).orElse(null);

        if (existingVehicle == null) {
            return null;
        }

        existingVehicle.setRegistrationNumber(
                vehicle.getRegistrationNumber());
        existingVehicle.setModel(vehicle.getModel());
        existingVehicle.setStatus(vehicle.getStatus());
        existingVehicle.setLocation(vehicle.getLocation());

        return vehicleRepository.save(existingVehicle);
    }

    // Updates only the status field — called by Maintenance and Trip services
    // via their Feign clients
    public Vehicle updateVehicleStatus(Long id, String status) {

        Vehicle existingVehicle =
                vehicleRepository.findById(id).orElse(null);

        if (existingVehicle == null) {
            return null;
        }

        existingVehicle.setStatus(status);

        return vehicleRepository.save(existingVehicle);
    }

    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }
}