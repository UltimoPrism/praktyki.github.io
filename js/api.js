{
  "openapi": "3.0.3",
  "info": {
    "title": "API Ubezpieczenia",
    "version": "0.0.1"
  },
  "paths": {
    "/ubezpieczenia": {
      "post": {
        "summary": "Dodaj nowy wniosek ubezpieczeniowy",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/wniosek"
              },
              "example": {
                "imie": "Jan",
                "nazwisko": "Kowalski",
                "dataUrodzenia": "1985-05-15",
                "pesel": "",
                "ulica": "Marszałkowska",
                "nrDomu": "10A",
                "nrMieszkania": "5",
                "kodPocztowy": "00-001",
                "miasto": "Warszawa",
                "telefon": "+48123456789",
                "wariant": "BP21_1",
                "numerWycieczki": "WYCZ123",
                "krajDocelowy": "Włochy",
                "typWycieczki": "P",
                "dataZawarciaUmowyLubZaliczki": "2025-01-10",
                "dataWykupieniaUbezpieczenia": "2025-01-12",
                "dataImprezyOd": "2025-07-01",
                "dataImprezyDo": "2025-07-10",
                "cenaImprezy": 2500.5,
                "walutaCenyImprezy": "PLN",
                "rodzajDojazdu": "Z",
                "numerRezerwacji": 45678
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Wniosek został zapisany"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "wniosek": {
        "type": "object",
        "required": [
          "imie",
          "nazwisko",
          "wariant",
          "krajDocelowy",
          "typWycieczki",
          "dataImprezyOd",
          "dataImprezyDo"
        ],
        "properties": {
          "imie": { "type": "string" },
          "nazwisko": { "type": "string" },
          "dataUrodzenia": { "type": "string", "format": "date" },
          "pesel": { "type": "string" },
          "ulica": { "type": "string" },
          "nrDomu": { "type": "string" },
          "nrMieszkania": { "type": "string" },
          "kodPocztowy": { "type": "string" },
          "miasto": { "type": "string" },
          "telefon": { "type": "string" },
          "wariant": {
            "type": "string",
            "enum": [
              "BP21_1", "BP21_2", "BP21_3", "BP21_4", "BP21_5", "BP21_6",
              "BR23_1", "BR23_2", "BR23_3", "BR23_4", "NNW24_1"
            ]
          },
          "numerWycieczki": { "type": "string" },
          "krajDocelowy": { "type": "string" },
          "typWycieczki": {
            "type": "string",
            "enum": ["P", "O", "I", "BL", "N", "BW", "SZ", "R", "W", "CZ"]
          },
          "dataZawarciaUmowyLubZaliczki": { "type": "string", "format": "date" },
          "dataWykupieniaUbezpieczenia": { "type": "string", "format": "date" },
          "dataImprezyOd": { "type": "string", "format": "date" },
          "dataImprezyDo": { "type": "string", "format": "date" },
          "cenaImprezy": { "type": "number", "format": "float" },
          "walutaCenyImprezy": {
            "type": "string",
            "enum": ["PLN", "EUR", "USD"]
          },
          "rodzajDojazdu": {
            "type": "string",
            "enum": ["Z", "W"]
          },
          "numerRezerwacji": { "type": "integer" }
        }
      }
    }
  }
}
