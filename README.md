---

# Todos

- [ ] Unit tests
- [ ] Documentation
- [ ] Sort by creation date, not by edit date -> edit upload
- [ ] Additional display field? Scanned at xxx date & time
- [ ] Add favicon
- [ ] Modify scrollbar display
- [ ] TEST EVENTBRITE PULLS
- [X] verify that the population of the Attendee object matches the questions from the Fetched response

Changes to be done:
Shift to an event-first structure
```
Events
|-  Event1
|   |- User1
        |- Lead1
|   |- User2
|   |   |- Lead2
```

Create a new landing page after user login <- implement router?
Create a back button on the home page to select event

---

# Introduction

# Usage

# Config

- Before each event, check the questions asked in the sign up page. Update `populateAttendeeTemplate` to match the questions asked.
- Compare the receipt printed out with the ID field. It should be given by `order_id` + `id` + 001

#
