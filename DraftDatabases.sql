CREATE DATABASE saves;

-- CREATE TABLE [IF NOT EXISTS] users(
--     user_id INT GENERATED ALWAYS AS IDENTITY,
--     net_id VARCHAR(255) NOT NULL,
--     username VARCHAR(255) NOT NULL,
--     PRIMARY KEY(user_id)
-- );

CREATE TABLE [IF NOT EXISTS] room_save(
    save_id INT GENERATED ALWAYS AS IDENTITY,
    net_id VARCHAR(255) NOT NULL,
    save_name VARCHAR(255) NOT NULL,
    created_on TIMESTAMP NOT NULL,
    last_login TIMESTAMP
    room_width INT(5) NOT NULL,
    room_height INT(5) NOT NULL,
    -- last_login created_on TIMESTAMP NOT NULL,
    -- last_login TIMESTAMP
);


CREATE TABLE [IF NOT EXISTS] furniture_save(
   --furniture_id INT GENERATED ALWAYS AS IDENTITY,
   save_id INT NOT NULL,
   furniture_type varchar(50) NOT NULL, --bed, dresser, etc
   width float(5) NOT NULL,
   height float(5) NOT NULL,
   -- rotation in degrees
   rotation float(5) NOT NULL,
   x_coord int(5) NOT NULL,
   y_coord int(5) NOT NULL,
   rotation int(5) NOT NULL,
);

INSERT INTO users(net_id, username)
INSERT INTO 
VALUES('bms6, Brandon Spellman'),
      ('Robert Dondero, rdondero');

	   
--INSERT INTO furniture_save(user_id, save_name, furniture_type, x_coord, y_coord, rotation)
--VALUES(bms6,'Slums 1901','bed','34','12','0'),
--      (bms6,'Slums 1901','dressser','34','0','90');