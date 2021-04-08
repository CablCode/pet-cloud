import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Welcome = () => {
	return (
		<section className="welcome">
			<Container fluid>
				<Row>
					<Col className="pt-5">
						<h1 className="mt-5 welcomeHeader">
							La información de las mascotas, cuando y como la necesitas
						</h1>
					</Col>
				</Row>
				<Row>
					<Col>
						<img
							className="img-fluid"
							src="https://raw.githubusercontent.com/NicolasArayaB/pet-cloud/18.1-front-proposal/src/front/img/petcloud-dog.png"
						/>
					</Col>
				</Row>
			</Container>
		</section>
	);
};

export default Welcome;
