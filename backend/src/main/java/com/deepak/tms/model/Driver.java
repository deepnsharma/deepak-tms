package com.deepak.tms.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Driver {
    private String id;
    private String transporterId;
    private String driverName;
    private String aadhaarCardNumber;
    private String drivingLicenseNumber;
    private String licenseExpiryDate;
    private String assignedVehicle;
    private String status;
}
