### 1.11.0 on 22.05.2022
- Added automatic resources transfer between villages, with predefined resource availability,
  both for source and for target villages
- Currently, only "BALANCED" priority order is available

### 1.10.0 on 22.05.2022
- Added global auth point for every executor
- Removed closing of socket connection upon action termination
- Implemented in-memory session by auth
- Implemented session reusing between multiple different config executions, which in turn reduces
  the number of login requests and restarts while using browser/mobile app

### 1.9.0 on 17.05.2022
- Fixed bug with units relocation
- Added provision amount per unit type into units relocation calculation
- Fixed a bug with failed units recruitment
- Added maximum upgrade level per building name

### 1.8.0 on 01.05.2022
- Added new feature - automatic units relocation

### 1.7.1 on 23.04.2022
- Added some default schema values

### 1.7.0 on 23.04.2022
- Documentation updated, endpoints refactored, missing endpoints added

### 1.6.1 on 22.04.2022
- Patched farming API: added new param for maximum attacks per farming village

### 1.6.0 on 19.04.2022
- Updated (almost) all dependencies
- Added background color for google sheets

### 1.5.0 on 18.04.2022
- Added setup documentation

### 1.4.1 on 17.04.2022
- Automatic mechanism for recruit and building upgrades improved

### 1.4.0 on 17.04.2022
- GraphQL schema updated, documentation added

### 1.3.1 on 16.04.2022
- Init update of schema

### 1.3.0 on 16.04.2022
- Migration to "type: module" done

### 1.2.0 on 16.04.2022
- Transformed all exports
