package com.logifleet.vehicle_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.logifleet.vehicle_service.entity.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

}