package com.deepak.tms.controller;

import com.deepak.tms.model.Driver;
import com.deepak.tms.model.Transporter;
import com.deepak.tms.model.Vehicle;
import com.deepak.tms.service.MockDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class MasterDataController {

    @Autowired
    private MockDataService dataService;

    // Transporters
    @GetMapping("/transporters")
    public List<Transporter> getTransporters() {
        return dataService.transporters;
    }

    @GetMapping("/transporters/{id}")
    public Transporter getTransporter(@PathVariable String id) {
        return dataService.findById(dataService.transporters, id, Transporter::getId).orElse(null);
    }

    // Vehicles
    @GetMapping("/vehicles")
    public List<Vehicle> getVehicles(@RequestParam(required = false) String transporterId) {
        if (transporterId != null && !transporterId.isEmpty()) {
            return dataService.vehicles.stream()
                    .filter(v -> transporterId.equals(v.getTransporterId()))
                    .collect(Collectors.toList());
        }
        return dataService.vehicles;
    }

    @PostMapping("/vehicle")
    public Vehicle addVehicle(@RequestBody Vehicle vehicle) {
        vehicle.setId("V-" + UUID.randomUUID().toString().substring(0, 5));
        vehicle.setStatus("Active");
        dataService.vehicles.add(vehicle);
        return vehicle;
    }

    @DeleteMapping("/vehicles/{id}")
    public void deleteVehicle(@PathVariable String id) {
        dataService.vehicles.removeIf(v -> id.equals(v.getId()));
    }

    // Drivers
    @GetMapping("/drivers")
    public List<Driver> getDrivers(@RequestParam(required = false) String transporterId) {
        if (transporterId != null && !transporterId.isEmpty()) {
            return dataService.drivers.stream()
                    .filter(d -> transporterId.equals(d.getTransporterId()))
                    .collect(Collectors.toList());
        }
        return dataService.drivers;
    }

    @PostMapping("/driver")
    public Driver addDriver(@RequestBody Driver driver) {
        driver.setId("D-" + UUID.randomUUID().toString().substring(0, 5));
        driver.setStatus("Active");
        dataService.drivers.add(driver);
        return driver;
    }

    @DeleteMapping("/drivers/{id}")
    public void deleteDriver(@PathVariable String id) {
        dataService.drivers.removeIf(d -> id.equals(d.getId()));
    }
}
