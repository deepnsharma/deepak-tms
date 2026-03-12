package com.deepak.tms.service;

import com.deepak.tms.model.*;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MockDataService {

    public List<Transporter> transporters = new ArrayList<>();
    public List<Contract> contracts = new ArrayList<>();
    public List<Vehicle> vehicles = new ArrayList<>();
    public List<Driver> drivers = new ArrayList<>();
    public List<DeliveryOrder> deliveryOrders = new ArrayList<>();
    public List<Trip> trips = new ArrayList<>();
    public List<Invoice> invoices = new ArrayList<>();

    @PostConstruct
    public void init() {
        // Transporters
        transporters.add(new Transporter("TR-001", "Patel Logistics", "Rajesh Patel", "9876543210", "rajesh@patellogistics.in", "Ahmedabad", "Active"));
        transporters.add(new Transporter("TR-002", "RK Logistics", "Ravi Kumar", "9876543211", "ravi@rklogistics.in", "Mumbai", "Active"));

        // Contracts
        contracts.add(new Contract("C-1001", "TR-001", "ChemCorp", "Chemical Drums", "Dahej", "Ahmedabad", "Tanker", "RT-01", 8500.0, "Per Trip", "2026-01-01", "2026-12-31"));
        contracts.add(new Contract("C-1002", "TR-001", "SteelCo", "Steel Coils", "Vadodara", "Mumbai", "Truck", "RT-02", 12000.0, "Per Trip", "2026-01-01", "2026-12-31"));
        contracts.add(new Contract("C-1003", "TR-002", "AgriLife", "Fertilizer Bags", "Bharuch", "Delhi", "Trailer", "RT-03", 25000.0, "Per Trip", "2026-01-01", "2026-12-31"));

        // Vehicles
        vehicles.add(new Vehicle("V-101", "TR-001", "GJ01AB1111", "RC1111", "INS-1111", "2026-10-15", "20 Ton", "Tanker", 1, "Active"));
        vehicles.add(new Vehicle("V-102", "TR-001", "GJ01AB2222", "RC2222", "INS-2222", "2026-08-20", "25 Ton", "Truck", 1, "Active"));

        // Drivers
        drivers.add(new Driver("D-101", "TR-001", "Ramesh Bhai", "AAD1111", "DL1111", "2028-05-10", "GJ01AB1111", "Active"));
        drivers.add(new Driver("D-102", "TR-001", "Suresh Kumar", "AAD2222", "DL2222", "2027-11-22", "GJ01AB2222", "Active"));

        // Delivery Orders (Open / Assigned)
        deliveryOrders.add(new DeliveryOrder("DO-10045", null, "Dahej", "Ahmedabad", "Chemical Drums", "20 Ton", "Tanker", "2026-03-20", "Bidding", null));
        deliveryOrders.add(new DeliveryOrder("DO-10046", null, "Vadodara", "Mumbai", "Steel Coils", "25 Ton", "Truck", "2026-03-21", "Open", null));
        deliveryOrders.add(new DeliveryOrder("DO-10047", "TR-001", "Bharuch", "Delhi", "Fertilizer Bags", "30 Ton", "Trailer", "2026-03-18", "Assigned", 24500.0));
        
        // Trips (Ongoing for Assigned DO)
        trips.add(new Trip("T-10047", "DO-10047", "TR-001", "INV-SAP-991", "2026-03-17", null, null, 0.0, 0.0, 30.0, null, 0.0, null, "Ongoing"));
    }

    public <T> Optional<T> findById(List<T> list, String id, java.util.function.Function<T, String> idExtractor) {
        return list.stream().filter(item -> id.equals(idExtractor.apply(item))).findFirst();
    }
}
