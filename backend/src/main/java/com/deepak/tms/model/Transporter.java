package com.deepak.tms.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transporter {
    private String id;
    private String name;
    private String contactPerson;
    private String phone;
    private String email;
    private String address;
    private String status;
}
