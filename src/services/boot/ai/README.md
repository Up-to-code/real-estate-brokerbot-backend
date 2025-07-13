# AI Module Structure

This folder contains the AI integration logic for real estate message processing. The code is organized for maintainability and testability.

## Structure

- `types/` — TypeScript types and interfaces for the AI module
- `utils/` — Utility functions and mappings (e.g., language detection, type mapping)
- `services/` — Service classes for OpenAI integration and response parsing
- `processRealEstateMessage.ts` — Main orchestrator function for processing messages
- `index.ts` — Barrel export for all module features

## Usage

Import the main function or any class/type as needed:

```ts
import { processRealEstateMessage, OpenAIServiceImpl, ResponseParserImpl } from './ai';
```

## Testing

Use `createMockServices` from `processRealEstateMessage.ts` for mocking in tests. 

# Real Estate AI Message Flow

```mermaid
flowchart TD
    Start["User sends message (search, PDF, etc.)"]
    Start --> GenResp["generateResponse"]
    GenResp --> TypeCheck{"Response type?"}
    TypeCheck -- "Answer" --> ReturnAnswer["Return answer text"]
    TypeCheck -- "Search" --> HandleSearch["handleSearch"]
    HandleSearch --> SearchProps["searchProperties"]
    SearchProps --> ShowProps["Return properties (with real property IDs)"]
    HandleSearch --> SaveSearch["saveSearchHistory (stores propertyId)"]
    TypeCheck -- "Event" --> EventType{"Event type?"}
    EventType -- "generate_property_pdf" --> PDFHandler["handleGeneratePropertyPdfEvent"]
    PDFHandler --> ValidID{"propertyId is valid UUID?"}
    ValidID -- "Yes" --> FindByID["Find property by ID"]
    ValidID -- "No" --> LastFromHistory["extractLastPropertyIdFromHistory"]
    LastFromHistory --> FoundLast{"Found?"}
    FoundLast -- "Yes" --> FindByLastID["Find property by last propertyId"]
    FoundLast -- "No" --> FallbackCity["Find property by city (legacy)"]
    FindByID --> PropFound
    FindByLastID --> PropFound
    FallbackCity --> PropFound
    PropFound{"Property found?"}
    PropFound -- "Yes" --> PDFSuccess["Return PDF created message with real property ID"]
    PropFound -- "No" --> PDFError["Return error: property not found"]
    EventType -- "Other event" --> OtherEvent["Handle other event types"]
    TypeCheck -- "Unknown" --> NoResp["Return: No response found"]
```

---

This chart shows the main flow from user message to PDF generation, including all key decision points and how property IDs are handled for robust, type-safe processing. 