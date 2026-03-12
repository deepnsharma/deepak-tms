package com.deepak.tms.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Trip {
    private String id;
    private String doId;
    private String transporterId;
    private String invoiceReference; // if generated from SAP
    
    // POD Fields
    private String actualReportingDate;
    private String dateOfReachingDestination;
    private String dateOfUnloading;
    
    // Auto-calculated
    private Double detentionAtSource;
    private Double detentionAtDestination;
    
    // Quantities
    private Double billedQty;
    private Double actualQtyUnloaded;
    private Double shortages;
    
    private String lrAttachmentUrl;
    private String status; // Ongoing, POD Done
}
