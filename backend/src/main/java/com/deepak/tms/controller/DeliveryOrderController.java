package com.deepak.tms.controller;

import com.deepak.tms.model.DeliveryOrder;
import com.deepak.tms.model.Notification;
import com.deepak.tms.service.MockDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class DeliveryOrderController {

    @Autowired
    private MockDataService dataService;

    @Autowired
    private NotificationController notificationController;

    @GetMapping("/delivery-orders")
    public List<DeliveryOrder> getDeliveryOrders(@RequestParam(required = false) String transporterId, @RequestParam(required = false) String status) {
        return dataService.deliveryOrders.stream()
                .filter(doObj -> transporterId == null || transporterId.equals(doObj.getTransporterId()) || (doObj.getTransporterId() == null && "Open".equals(doObj.getStatus())))
                .filter(doObj -> status == null || status.equals(doObj.getStatus()))
                .collect(Collectors.toList());
    }

    @GetMapping("/delivery-orders/{id}")
    public DeliveryOrder getDeliveryOrder(@PathVariable String id) {
        return dataService.findById(dataService.deliveryOrders, id, DeliveryOrder::getId).orElse(null);
    }

    @PatchMapping("/delivery-orders/{id}")
    public DeliveryOrder updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        DeliveryOrder order = dataService.findById(dataService.deliveryOrders, id, DeliveryOrder::getId).orElse(null);
        if (order != null && body.containsKey("status")) {
            order.setStatus(body.get("status"));
        }
        return order;
    }

    @PostMapping("/assign-transporter")
    public Map<String, Object> assignTransporter(@RequestBody Map<String, Object> body) {
        String doId = (String) body.get("doId");
        String transporterId = (String) body.get("transporterId");
        Double price = Double.valueOf(body.get("price").toString());

        DeliveryOrder order = dataService.findById(dataService.deliveryOrders, doId, DeliveryOrder::getId).orElse(null);
        if (order != null) {
            order.setTransporterId(transporterId);
            order.setStatus("Assigned");
            order.setAssignedPrice(price);
        }
        
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("order", order);
        return res;
    }

    // BRD Specific: Transporter Accepts DO by placing a Vehicle
    @PostMapping("/delivery-orders/{id}/accept")
    public Map<String, Object> acceptDO(@PathVariable String id, @RequestBody Map<String, String> body) {
        String transporterId = body.get("transporterId");
        String vehicleId = body.get("vehicleId"); // BRD says select a vehicle to accept
        
        DeliveryOrder order = dataService.findById(dataService.deliveryOrders, id, DeliveryOrder::getId).orElse(null);
        if (order != null) {
            order.setTransporterId(transporterId);
            order.setStatus("Assigned");
            // Optional: link vehicle reference here if we add assignedVehicle field to DO
            
            // Notify via SSE if needed, or just return success
        }
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("order", order);
        return res;
    }

    // Bids endpoints to keep frontend backward compatible for MVP 
    private List<Map<String, Object>> mockBids = new ArrayList<>();

    @PostMapping("/bid")
    public Map<String, Object> submitBid(@RequestBody Map<String, Object> bid) {
        bid.put("id", UUID.randomUUID().toString());
        bid.put("timestamp", LocalDateTime.now().toString());
        mockBids.add(bid);
        
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("bid", bid);
        return res;
    }

    @GetMapping("/bids/{doId}")
    public List<Map<String, Object>> getBids(@PathVariable String doId) {
        return mockBids.stream()
                .filter(b -> doId.equals(b.get("doId")))
                .sorted(Comparator.comparingDouble(b -> Double.parseDouble(b.get("price").toString())))
                .collect(Collectors.toList());
    }
}
