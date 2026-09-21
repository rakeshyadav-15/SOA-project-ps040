package com.logifleet.trip_service.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.logifleet.trip_service.client.VehicleClient;
import com.logifleet.trip_service.dto.VehicleResponse;
import com.logifleet.trip_service.entity.Trip;
import com.logifleet.trip_service.repository.TripRepository;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final VehicleClient vehicleClient;

    public TripService(TripRepository tripRepository,
                       VehicleClient vehicleClient) {
        this.tripRepository = tripRepository;
        this.vehicleClient = vehicleClient;
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public Trip getTripById(Long id) {
        return tripRepository.findById(id).orElse(null);
    }

    // Create a trip — vehicle must be AVAILABLE
    // Trip is saved with status ASSIGNED (driver/vehicle reserved)
    public Trip createTrip(Trip trip) {

        // Check whether the vehicle exists
        VehicleResponse vehicle =
                vehicleClient.getVehicleById(trip.getVehicleId());

        if (vehicle == null) {
            throw new RuntimeException("Vehicle not found with id: "
                    + trip.getVehicleId());
        }

        // Vehicle must be AVAILABLE
        if ("UNDER_MAINTENANCE".equalsIgnoreCase(vehicle.getStatus())) {
            throw new RuntimeException(
                    "Cannot assign trip: vehicle is UNDER_MAINTENANCE");
        }

        if ("ON_TRIP".equalsIgnoreCase(vehicle.getStatus())) {
            throw new RuntimeException(
                    "Cannot assign trip: vehicle is already ON_TRIP");
        }

        if (!"AVAILABLE".equalsIgnoreCase(vehicle.getStatus())) {
            throw new RuntimeException(
                    "Cannot assign trip: vehicle is not AVAILABLE");
        }

        // Save with ASSIGNED status
        trip.setStatus("ASSIGNED");
        return tripRepository.save(trip);
    }

    // Start a trip — vehicle becomes ON_TRIP
    public Trip startTrip(Long id) {

        Trip trip = tripRepository.findById(id).orElse(null);

        if (trip == null) {
            return null;
        }

        if (!"ASSIGNED".equalsIgnoreCase(trip.getStatus())) {
            throw new RuntimeException(
                    "Trip cannot be started: current status is "
                    + trip.getStatus());
        }

        trip.setStatus("IN_PROGRESS");
        Trip saved = tripRepository.save(trip);

        // Set vehicle to ON_TRIP via Feign
        vehicleClient.updateVehicleStatus(trip.getVehicleId(), "ON_TRIP");

        return saved;
    }

    // Complete a trip — vehicle becomes AVAILABLE
    public Trip completeTrip(Long id) {

        Trip trip = tripRepository.findById(id).orElse(null);

        if (trip == null) {
            return null;
        }

        if (!"IN_PROGRESS".equalsIgnoreCase(trip.getStatus())) {
            throw new RuntimeException(
                    "Trip cannot be completed: current status is "
                    + trip.getStatus());
        }

        trip.setStatus("COMPLETED");
        Trip saved = tripRepository.save(trip);

        // Return vehicle to AVAILABLE via Feign
        vehicleClient.updateVehicleStatus(trip.getVehicleId(), "AVAILABLE");

        return saved;
    }

    // Cancel a trip — vehicle returns to AVAILABLE
    public Trip cancelTrip(Long id) {

        Trip trip = tripRepository.findById(id).orElse(null);

        if (trip == null) {
            return null;
        }

        if ("COMPLETED".equalsIgnoreCase(trip.getStatus())
                || "CANCELLED".equalsIgnoreCase(trip.getStatus())) {
            throw new RuntimeException(
                    "Trip cannot be cancelled: current status is "
                    + trip.getStatus());
        }

        String previousStatus = trip.getStatus();
        trip.setStatus("CANCELLED");
        Trip saved = tripRepository.save(trip);

        // Only update vehicle if trip had actually started
        // (ASSIGNED → vehicle was still AVAILABLE, no need to reset)
        if ("IN_PROGRESS".equalsIgnoreCase(previousStatus)) {
            vehicleClient.updateVehicleStatus(
                    trip.getVehicleId(), "AVAILABLE");
        }

        return saved;
    }

    public Trip updateTrip(Long id, Trip trip) {

        Trip existingTrip =
                tripRepository.findById(id).orElse(null);

        if (existingTrip == null) {
            return null;
        }

        existingTrip.setVehicleId(trip.getVehicleId());
        existingTrip.setDriverId(trip.getDriverId());
        existingTrip.setSource(trip.getSource());
        existingTrip.setDestination(trip.getDestination());
        existingTrip.setStatus(trip.getStatus());

        return tripRepository.save(existingTrip);
    }

    public void deleteTrip(Long id) {
        tripRepository.deleteById(id);
    }
}