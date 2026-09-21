package com.logifleet.trip_service.controller;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.logifleet.trip_service.entity.Trip;
import com.logifleet.trip_service.service.TripService;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    // Get all trips
    @GetMapping
    public List<Trip> getAllTrips() {
        return tripService.getAllTrips();
    }

    // Get trip by ID
    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable Long id) {

        Trip trip = tripService.getTripById(id);

        if (trip == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(trip);
    }

    // Create a trip (status will be set to ASSIGNED automatically)
    @PostMapping
    public ResponseEntity<?> createTrip(@Valid @RequestBody Trip trip) {

        try {
            Trip created = tripService.createTrip(trip);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Start a trip — vehicle becomes ON_TRIP, trip becomes IN_PROGRESS
    @PutMapping("/{id}/start")
    public ResponseEntity<?> startTrip(@PathVariable Long id) {

        try {
            Trip started = tripService.startTrip(id);
            if (started == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(started);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Complete a trip — vehicle returns to AVAILABLE, trip becomes COMPLETED
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeTrip(@PathVariable Long id) {

        try {
            Trip completed = tripService.completeTrip(id);
            if (completed == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(completed);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Cancel a trip — vehicle returns to AVAILABLE (if trip was IN_PROGRESS)
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelTrip(@PathVariable Long id) {

        try {
            Trip cancelled = tripService.cancelTrip(id);
            if (cancelled == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(cancelled);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Generic update (full replacement)
    @PutMapping("/{id}")
    public ResponseEntity<Trip> updateTrip(
            @PathVariable Long id,
            @Valid @RequestBody Trip trip) {

        Trip updatedTrip = tripService.updateTrip(id, trip);

        if (updatedTrip == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedTrip);
    }

    // Delete trip
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long id) {

        tripService.deleteTrip(id);

        return ResponseEntity.noContent().build();
    }
}