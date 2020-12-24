CREATE TABLE holdings (
	id INT unsigned NOT NULL AUTO_INCREMENT,
	coin VARCHAR(150) NOT NULL,
	amount DECIMAL(19,8) NOT NULL,
    wallet VARCHAR(150),
    isInterest BOOLEAN,
    date DATE,
    isPromo BOOLEAN,
    deposit DECIMAL(19,8),
    depositCurrency VARCHAR(150),
    price DECIMAL(19,8) unsigned,
    totalDeposits BOOLEAN,
	PRIMARY KEY (id)
);
