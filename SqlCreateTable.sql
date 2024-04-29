drop table Arduino.Data;
create table Arduino.Data (
	id int AUTO_INCREMENT PRIMARY KEY,
    date_heure datetime,
    temperature float,
    humidity float,
    c02 numeric,
    voc numeric
);

select * from  Arduino.Data;

INSERT INTO Arduino.Data (date_heure, temperature, humidity, c02,voc)
VALUES ('2024-04-22 12:00:00', 25.5, 60.2, 800,9);