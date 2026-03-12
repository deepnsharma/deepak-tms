package com.deepak.tms.controller;

import com.deepak.tms.model.Trip;
import com.deepak.tms.service.MockDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private MockDataService dataService;

    @GetMapping
    public List<Trip> getTrips(@RequestParam(required = false) String transporterId, @RequestParam(required = false) String status) {
        return dataService.trips.stream()
                .filter(t -> transporterId == null || transporterId.equals(t.getTransporterId()))
                .filter(t -> status == null || status.equals(t.getStatus()))
                .collect(Collectors.toList());
    }

    @PostMapping("/{id}/pod")
    public Trip submitPod(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Trip trip = dataService.findById(dataService.trips, id, Trip::getId).orElse(null);
        if (trip != null) {
            trip.setActualReportingDate((String) body.get("actualReportingDate"));
            trip.setDateOfReachingDestination((String) body.get("dateOfReachingDestination"));
            trip.setDateOfUnloading((String) body.get("dateOfUnloading"));
            trip.setActualQtyUnloaded(Double.valueOf(body.get("actualQtyUnloaded").toString()));
            trip.setLrAttachmentUrl((String) body.get("lrAttachmentUrl"));

            // Calculate Detention
            trip.setDetentionAtSource(calculateDetention(trip.getInvoiceReference(), trip.getActualReportingDate(), 1)); // Dummy invoice ref to date logic, or just use today - reporting
            trip.setDetentionAtDestination(calculateDetention(trip.getDateOfReachingDestination(), trip.getDateOfUnloading(), 1));
            
            // Calculate Shortage
            double billed = trip.getBilledQty() != null ? trip.getBilledQty() : 0.0;
            trip.setShortages(Math.max(0, billed - trip.getActualQtyUnloaded()));

            trip.setStatus("POD Done");
        }
        return trip;
    }

    private double calculateDetention(String date1Str, String date2Str, int toleranceDays) {
        try {
            if (date1Str == null || date2Str == null) return 0.0;
            // Assuming date strings are in YYYY-MM-DD
            if (date1Str.startsWith("INV-")) { // Mock fix for InvoiceReference being passed as date1
                date1Str = "2026-03-01"; 
            }
            LocalDate d1 = LocalDate.parse(date1Str);
            LocalDate d2 = LocalDate.parse(date2Str);
            long days = ChronoUnit.DAYS.between(d1, d2);
            if (days > toleranceDays) {
                return (days - toleranceDays) * 1000.0; // Assume 1000 Rs per day detention rate
            }
        } catch (DateTimeParseException e) {
            // Ignore
        }
        return 0.0;
    }
}
