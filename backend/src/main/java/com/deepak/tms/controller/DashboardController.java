package com.deepak.tms.controller;

import com.deepak.tms.model.DeliveryOrder;
import com.deepak.tms.model.Invoice;
import com.deepak.tms.model.Transporter;
import com.deepak.tms.model.Trip;
import com.deepak.tms.service.MockDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stats")
public class DashboardController {

    @Autowired
    private MockDataService dataService;

    @GetMapping
    public Map<String, Object> getStats(@RequestParam(required = false) String transporterId) {
        Map<String, Object> stats = new HashMap<>();

        if (transporterId != null && !transporterId.isEmpty()) {
            // Transporter Specific KPIs
            long ongoingTrips = dataService.trips.stream()
                    .filter(t -> transporterId.equals(t.getTransporterId()) && "Ongoing".equals(t.getStatus()))
                    .count();
            
            long completedTrips = dataService.trips.stream()
                    .filter(t -> transporterId.equals(t.getTransporterId()) && "POD Done".equals(t.getStatus()))
                    .count();

            long pendingAcceptance = dataService.deliveryOrders.stream()
                    .filter(doObj -> transporterId.equals(doObj.getTransporterId()) && "Open".equals(doObj.getStatus()))
                    .count();

            double openInvoices = dataService.invoices.stream()
                    .filter(inv -> transporterId.equals(inv.getTransporterId()) && !"L3_Approved".equals(inv.getStatus()) && !"Rejected".equals(inv.getStatus()))
                    .mapToDouble(Invoice::getClaimedAmount)
                    .sum();

            stats.put("ongoingTrips", ongoingTrips);
            stats.put("completedTrips", completedTrips);
            stats.put("pendingAcceptance", pendingAcceptance);
            stats.put("openInvoices", openInvoices);
            
            // Dummy chart data
            stats.put("onTimePlacement", 92); // 92% on time
            
            Map<String, Object> chart1 = new HashMap<>();
            chart1.put("product", "Chemical Drums");
            chart1.put("quantity", 150);
            
            Map<String, Object> chart2 = new HashMap<>();
            chart2.put("product", "Steel Coils");
            chart2.put("quantity", 300);
            
            stats.put("qtyTransported", java.util.Arrays.asList(chart1, chart2));

        } else {
            // Admin KPIs
            long ongoingTrips = dataService.trips.stream().filter(t -> "Ongoing".equals(t.getStatus())).count();
            long completedTrips = dataService.trips.stream().filter(t -> "POD Done".equals(t.getStatus())).count();
            long openDOs = dataService.deliveryOrders.stream().filter(doObj -> "Open".equals(doObj.getStatus())).count();
            
            double openInvoices = dataService.invoices.stream()
                    .filter(inv -> !"L3_Approved".equals(inv.getStatus()) && !"Rejected".equals(inv.getStatus()))
                    .mapToDouble(Invoice::getClaimedAmount)
                    .sum();

            stats.put("ongoingTrips", ongoingTrips);
            stats.put("completedTrips", completedTrips);
            stats.put("openDOs", openDOs);
            stats.put("openInvoices", openInvoices);

            // Transporter rankings for Admin
            List<Map<String, Object>> topTransporters = dataService.transporters.stream().map(t -> {
                long tTrips = dataService.trips.stream()
                        .filter(tr -> t.getId().equals(tr.getTransporterId()) && "POD Done".equals(tr.getStatus()))
                        .count();
                Map<String, Object> map = new HashMap<>();
                map.put("name", t.getName());
                map.put("completedOrders", tTrips);
                return map;
            }).collect(Collectors.toList());

            stats.put("topTransporters", topTransporters);
        }

        return stats;
    }
}
