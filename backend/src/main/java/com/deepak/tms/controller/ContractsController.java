package com.deepak.tms.controller;

import com.deepak.tms.model.Contract;
import com.deepak.tms.service.MockDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/contracts")
public class ContractsController {

    @Autowired
    private MockDataService dataService;

    @GetMapping
    public List<Contract> getContracts(@RequestParam(required = false) String transporterId) {
        if (transporterId != null && !transporterId.isEmpty()) {
            return dataService.contracts.stream()
                    .filter(c -> transporterId.equals(c.getTransporterId()))
                    .collect(Collectors.toList());
        }
        return dataService.contracts;
    }
}
