package com.mycompany.noticeme.cucumber;

import com.mycompany.noticeme.NoticeMeApp;
import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.web.WebAppConfiguration;

@CucumberContextConfiguration
@SpringBootTest(classes = NoticeMeApp.class)
@WebAppConfiguration
public class CucumberTestContextConfiguration {}
