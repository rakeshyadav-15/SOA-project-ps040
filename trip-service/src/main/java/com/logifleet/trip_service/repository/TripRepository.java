package com.logifleet.trip_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.logifleet.trip_service.entity.Trip;

public interface TripRepository extends JpaRepository<Trip, Long> {

}