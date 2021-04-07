const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			conditions: [],
			login: [],
			users: [],
			observations: {},
			pets: {},
			petById: {},
			vaccines: {},
			role: {},
			userPets: [],
			id: []
		},

		actions: {
			setLogin: (user, history) => {
				fetch(process.env.BACKEND_URL + "/api/login", {
					method: "POST",
					body: JSON.stringify(user),
					headers: { "Content-type": "application/json" }
				})
					.then(resp => resp.json())
					.then(data => {
						console.log(history, "<--- data login");
						const loginData = {
							token: data.token,
							email: data.user.email,
							first_name: data.first_name,
							id: data.user.id,
							is_vet: data.is_vet
						};
						setStore({ login: loginData });
						if (typeof Storage !== "undefined") {
							localStorage.setItem("token", loginData.token);
							localStorage.setItem("is_vet", JSON.stringify(loginData.is_vet));
							localStorage.setItem("email", loginData.email);
							history.push(data.is_vet === "1" ? "/vet" : "/user");
						} else {
							// LocalStorage no soportado en este navegador
							alert("Lo sentimos, tu navegador no es compatible.");
						}
					})
					.catch(error => console.log("Error loading message from backend", error));
			},

			getToken: () => {
				const tokenLocal = localStorage.getItem("token");
				const userLocal = JSON.parse(localStorage.getItem("user"));
				const firstNameLocal = JSON.parse(localStorage.getItem("first_name"));
				const role = localStorage.getItem("is_vet");
				setStore({
					role: {
						token: tokenLocal,
						user: userLocal,
						firstName: firstNameLocal,
						role: role
					}
				});
				console.log("tokenLocal -->", tokenLocal);
				console.log("userLocal -->", JSON.stringify(userLocal));
			},

			sendContactMsg: (name, email, message, role) => {
				fetch("https://kp0p375mk2.execute-api.sa-east-1.amazonaws.com/default/contactanos", {
					method: "POST",
					body: JSON.stringify({
						senderName: name,
						senderEmail: email,
						senderMessage: message,
						senderRole: role
					})
				})
					.then(resp => {
						if (!resp.ok) throw new Error("Error in fetch");
						return response.json();
					})
					.then(resp => {
						console.log("Email sent");
					})
					.catch(error => {
						console.log("Unexpected error");
					});
			},

			registerUser: user => {
				fetch(process.env.BACKEND_URL + "/api/register", {
					method: "POST",
					body: JSON.stringify(user),
					headers: { "Content-type": "application/json" }
				})
					.then(response => response.json())
					.then(data => {
						setStore({ user: data });
					})
					.catch(error => {
						console.log(error);
					});
			},
			getIdByChip: async id => {
				const request = await fetch(`https://fhir.cens.cl/baseR4/Patient?identifier=${parseInt(id)}`, {
					method: "GET",
					headers: { "Content-type": "application/json" }
				});
				const data = await request.json();
				const petId = data.entry[0].resource.id;
				setStore({ id: petId.split("-")[1] });
			},

			getPetById: async id => {
				const request = await fetch(`https://fhir.cens.cl/baseR4/Patient?identifier=${parseInt(id)}`, {
					method: "GET",
					headers: { "Content-type": "application/json" }
				});
				const data = await request.json();
				const dataPets = {
					id: data.entry[0].resource.id,
					name: data.entry[0].resource.name[0].given[0],
					species: data.entry[0].resource.extension[0].extension[0].valueCodeableConcept.coding[0].display,
					breed: data.entry[0].resource.extension[0].extension[1].valueCodeableConcept.coding[0].display,
					gender: data.entry[0].resource.gender,
					birthDate: data.entry[0].resource.birthDate,
					petOwner_name: data.entry[0].resource.contact[0].name.given[0],
					petOwner_father: data.entry[0].resource.contact[0].name.extension[0].valueString,
					petOwner_mother: data.entry[0].resource.contact[0].name.extension[1].valueString,
					address: data.entry[0].resource.contact[0].address.line[0],
					phone: data.entry[0].resource.contact[0].telecom[0].value,
					email: data.entry[0].resource.contact[0].telecom[1].value
				};

				setStore({ petById: dataPets });
				const petId = getStore().petById.id.split("-")[1];

				await getActions().getPetInformation(petId);
				await getActions().getPetCondition(petId);
				await getActions().getPetObservation(petId);
				await getActions().getPetVaccines(petId);
			},

			getPetCondition: id => {
				fetch(`https://fhir.cens.cl/baseR4/Condition/ENF-${id}`, {
					method: "GET",
					headers: { "Content-type": "application/json" }
				})
					.then(response => response.json())
					.then(data => {
						const store = getStore();
						const condition = data.code.coding[0].display;
						setStore({ conditions: [...store.conditions, condition] });
					});
			},

			newPetCondition: (id, cond) => {
				const condData = {
					resourceType: "Condition",
					clinicalStatus: {
						coding: [
							{
								system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
								code: "active"
							}
						]
					},
					code: {
						coding: [
							{
								system: "http://snomed.info/sct",
								display: cond
							}
						],
						text: cond
					},
					subject: {
						reference: `Patient/PET-${id}`
					}
				};

				fetch("https://fhir.cens.cl/baseR4/Condition/", {
					method: "POST",
					headers: { "Content-type": "application/json" },
					body: JSON.stringify(condData)
				})
					.then(data => data.json())
					.then(data => console.log(data, "cond data"))
					.catch(error => console.log(error));
			},

			getPetObservation: id => {
				fetch(`https://fhir.cens.cl/baseR4/Observation/INF-${id}`, {
					method: "GET",
					headers: { "Content-type": "application/json" }
				})
					.then(response => response.json())
					.then(data => {
						const lastUpdate = data.meta.lastUpdated.split("T");
						const obsData = {
							update: lastUpdate[0],
							weight: data.valueQuantity.value + " " + data.valueQuantity.unit
						};
						setStore({ observations: obsData });
					});
			},

			newPetObservation: (id, weight, unit) => {
				const obsData = {
					resourceType: "Observation",
					status: "final",
					category: [
						{
							coding: [
								{
									system: "http://terminology.hl7.org/CodeSystem/observation-category",
									code: "vital-signs",
									display: "Signos Vitales"
								}
							]
						}
					],
					code: {
						coding: [
							{
								system: "http://loinc.org",
								code: "8302-2",
								display: "Peso"
							}
						]
					},
					subject: {
						reference: `Patient/PET-${id}`
					},
					effectiveDateTime: "2021-07-02",
					valueQuantity: {
						value: weight,
						unit: unit,
						system: "http://unitsofmeasure.org"
					}
				};

				fetch("https://fhir.cens.cl/baseR4/Observation/", {
					method: "POST",
					headers: { "Content-type": "application/json" },
					body: JSON.stringify(obsData)
				})
					.then(response => response.json())
					.then(data => console.log(data, "weight"));
			},

			getPetVaccines: id => {
				fetch(`https://fhir.cens.cl/baseR4/Immunization/VAC-${id}`, {
					method: "GET",
					headers: { "Content-type": "application/json" }
				})
					.then(response => response.json())
					.then(data => {
						const vaccine = {
							vaccine: data.vaccineCode.text,
							date: data.occurrenceDateTime
						};
						setStore({ vaccines: vaccine });
					});
			},

			newPetVaccine: (id, vaccine, value) => {
				const vacData = {
					resourceType: "Immunization",
					status: "completed",
					vaccineCode: {
						coding: [
							{
								system: "http://hl7.org/fhir/sid/cvx",
								code: "40"
							}
						],
						text: vaccine
					},
					patient: {
						reference: `Patient/PET-${id}`
					},
					occurrenceDateTime: "2020-01-10",
					doseQuantity: {
						value: value,
						system: "http://unitsofmeasure.org",
						code: "UI"
					}
				};
				fetch("https://fhir.cens.cl/baseR4/Immunization/", {
					method: "POST",
					headers: { "Content-type": "application/json" },
					body: JSON.stringify(vacData)
				})
					.then(data => data.json())
					.then(data => console.log(data, "vaccines"));
			},

			getPetInformation: pets => {
				fetch(`https://fhir.cens.cl/baseR4/Patient/PET-${pets}`, {
					method: "GET",
					headers: { "Content-type": "application/json" }
				})
					.then(response => response.json())
					.then(data => {
						const dataPets = {
							name: data.name[0].given[0],
							identifier: data.identifier[0].value,
							gender: data.gender,
							birthDate: data.birthDate,
							species: data.extension[0].extension[0].valueCodeableConcept.coding[0].display,
							breed: data.extension[0].extension[1].valueCodeableConcept.coding[0].display,
							genderStatus: data.extension[0].extension[2].valueCodeableConcept.coding[0].code,
							petOwner_name: data.contact[0].name.given[0],
							petOwner_father: data.contact[0].name.extension[0].valueString,
							petOwner_mother: data.contact[0].name.extension[1].valueString,
							address: data.contact[0].address.line[0],
							phone: data.contact[0].telecom[0].value,
							email: data.contact[0].telecom[1].value
						};
						setStore({ pets: dataPets });
					})
					.catch(error => {
						console.log(error);
					});
			},

			getPets: () => {
				const selectPets = pets => {
					if (pets.user_email == localStorage.getItem("email")) {
						return pets.name;
					}
				};

				fetch(process.env.BACKEND_URL + "/api/user_pets", {
					method: "GET",
					headers: { "Content-type": "application/json" }
				})
					.then(response => response.json())
					.then(data => {
						let userPets = data.pets.filter(selectPets);
						console.log(userPets, "getPets");
						setStore({ userPets: userPets });
					})
					.catch(error => console.log(error));
			},

			fhirNewPet: (
				name,
				identifier,
				gender,
				birthDate,
				species,
				breed,
				genderStatus,
				petOwner_name,
				petOwner_mother,
				petOwner_father,
				address,
				phone,
				email
			) => {
				const fhirNewPet = {
					resourceType: "Patient",
					extension: [
						{
							url: "http://hl7.org/fhir/StructureDefinition/patient-animal",
							extension: [
								{
									url: "species",
									valueCodeableConcept: {
										coding: [
											{
												system: "http://hl7.org/fhir/animal-species",
												display: species
											}
										]
									}
								},
								{
									url: "breed",
									valueCodeableConcept: {
										coding: [
											{
												system: "http://snomed.info/sct",
												display: breed
											}
										]
									}
								},
								{
									url: "genderStatus",
									valueCodeableConcept: {
										coding: [
											{
												system: "http://hl7.org/fhir/animal-genderstatus",
												code: genderStatus
											}
										]
									}
								}
							]
						}
					],
					identifier: [
						{
							type: { text: "CHIP identifier" },
							system: "https://registratumascota.cl",
							value: identifier
						}
					],
					name: [{ given: name }],
					gender: gender,
					birthDate: birthDate,
					contact: [
						{
							name: {
								extension: [
									{
										url: "http://hl7.org/fhir/StructureDefinition/humanname-father-family",
										valueString: petOwner_father
									},
									{
										url: "http://hl7.org/fhir/StructureDefinition/humanname-mothers-family",
										valueString: petOwner_mother
									}
								],
								given: petOwner_name
							},
							telecom: [
								{ system: "phone", value: phone, use: "work" },
								{ system: "email", value: email }
							],
							address: { line: [address] }
						}
					]
				};
				fetch("https://fhir.cens.cl/baseR4/Patient", {
					method: "POST",
					headers: { "Content-type": "application/json" },
					body: JSON.stringify(fhirNewPet)
				})
					.then(resp => resp.json())
					.then(resp => {
						console.log("New pet has been created");
						setStore({ pets: dataPets });
					})
					.catch(error => {
						console.log("Unexpected error");
					});
			},

			petCloudNewPet: (name, identifier, email) => {
				const petCloudNewPet = {
					name: name,
					chip: identifier,
					email: email
				};

				fetch(process.env.BACKEND_URL + "/api/pet", {
					method: "POST",
					body: JSON.stringify(petCloudNewPet),
					headers: { "Content-type": "application/json" }
				})
					.then(resp => resp.json())
					.then(data => {
						console.log(data, "<--- new petCloud");
					})
					.catch(error => {
						console.log("Unexpected error");
					});
			}
		}
	};
};

export default getState;
