package com.deepak.tms.controller;

import com.deepak.tms.model.Invoice;
import com.deepak.tms.model.Trip;
import com.deepak.tms.service.MockDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private MockDataService dataService;

    @GetMapping
    public List<Invoice> getInvoices(@RequestParam(required = false) String transporterId, @RequestParam(required = false) String status) {
        return dataService.invoices.stream()
                .filter(i -> transporterId == null || transporterId.equals(i.getTransporterId()))
                .filter(i -> status == null || status.equals(i.getStatus()))
                .collect(Collectors.toList());
    }

    @PostMapping
    public Invoice submitInvoice(@RequestBody Map<String, Object> body) {
        String transporterId = (String) body.get("transporterId");
        String invoiceNumber = (String) body.get("invoiceNumber");
        String invoiceDate = (String) body.get("invoiceDate");
        Double claimedAmount = Double.valueOf(body.get("claimedAmount").toString());
        List<String> tripIds = (List<String>) body.get("tripIds");

        // Calculate expected amount
        // Expected Amount = (Contract Rate * Qty) + Detention - Shortage Deductions
        double expectedAmount = 0.0;
        if (tripIds != null) {
            for (String tid : tripIds) {
                Trip t = dataService.findById(dataService.trips, tid, Trip::getId).orElse(null);
                if (t != null) {
                    double rate = 25000.0; // Dummy mock contract rate mapped by DO
                    double qty = t.getActualQtyUnloaded() != null ? t.getActualQtyUnloaded() : 0.0;
                    double detention = (t.getDetentionAtSource() != null ? t.getDetentionAtSource() : 0.0) 
                                     + (t.getDetentionAtDestination() != null ? t.getDetentionAtDestination() : 0.0);
                    double shortagePenalty = (t.getShortages() != null ? t.getShortages() : 0.0) * 5000.0; // Mock 5000 per ton penalty

                    expectedAmount += (rate * qty) + detention - shortagePenalty;
                }
            }
        }

        Invoice invoice = Invoice.builder()
                .id("INV-" + UUID.randomUUID().toString().substring(0, 5))
                .transporterId(transporterId)
                .invoiceNumber(invoiceNumber)
                .invoiceDate(invoiceDate)
                .claimedAmount(claimedAmount)
                .expectedAmount(expectedAmount)
                .tripIds(tripIds)
                .status("Submitted")
                .build();

        dataService.invoices.add(invoice);
        return invoice;
    }

    @PatchMapping("/{id}/review")
    public Invoice reviewInvoice(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Invoice invoice = dataService.findById(dataService.invoices, id, Invoice::getId).orElse(null);
        if (invoice != null) {
            String newStatus = (String) body.get("status"); // L1_Approved, L2_Approved, L3_Approved, Rejected
            invoice.setStatus(newStatus);
            if (body.containsKey("rejectionReason")) {
                invoice.setRejectionReason((String) body.get("rejectionReason"));
            }
        }
        return invoice;
    }
}
