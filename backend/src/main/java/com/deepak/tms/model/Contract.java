package com.deepak.tms.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Contract {
    private String id;
    private String transporterId;
    private String company;
    private String product;
    private String origin;
    private String destination;
    private String vehicleType;
    private String routeCode;
    private Double rate;
    private String rateType; // Per Ton, Per Trip
    private String validFrom;
    private String validTo;
}
