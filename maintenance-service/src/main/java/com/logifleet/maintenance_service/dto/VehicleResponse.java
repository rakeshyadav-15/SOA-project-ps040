package com.logifleet.maintenance_service.dto;

public class VehicleResponse {

    private Long id;
    private String registrationNumber;
    private String model;
    private String status;
    private String location;

    public VehicleResponse() {
    }

    public Long getId() {
        return id;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public String getModel() {
        return model;
    }

    public String getStatus() {
        return status;
    }

    public String getLocation() {
        return location;
    }
}