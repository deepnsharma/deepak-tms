package com.deepak.tms.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
    private String id;
    private String transporterId;
    private String vehicleNumber;
    private String rcNumber;
    private String insurancePolicyNumber;
    private String insuranceExpiryDate;
    private String vehicleCapacity; // e.g., 20 Ton
    private String vehicleType;     // Truck, Tanker, Trailer
    private Integer compartments;
    private String status;          // Active, Inactive
}
