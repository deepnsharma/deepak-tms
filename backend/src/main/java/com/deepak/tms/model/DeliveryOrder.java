package com.deepak.tms.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryOrder {
    private String id;
    private String transporterId; // Null if open, set if assigned
    private String plant;
    private String destination;
    private String material;
    private String weight;
    private String vehicleType;
    private String deliveryDate;
    private String status;        // Open, Bidding, Assigned
    private Double assignedPrice; // Mapped from accepted bid
}
