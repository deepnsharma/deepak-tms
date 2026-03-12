package com.deepak.tms.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {
    private String id;
    private String transporterId;
    private String invoiceNumber; // Transporter's reference
    private String invoiceDate;
    private Double claimedAmount;
    private Double expectedAmount; // System calculated
    
    private List<String> tripIds; // Associated trips

    // Approval Workflow Status
    // Submitted, L1_Approved, L2_Approved, L3_Approved, Rejected
    private String status;
    private String rejectionReason;
}
