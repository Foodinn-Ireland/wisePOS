Steps:
- Create a Location
- Register the Reader to the Location


Tests:
  - state
    - connectedReader
    - status (connectionStatus)
    - paymentStatus

  - Connect
    - Status == not_connected
      - Try to Connect
        - start connection, status should go to 'connecting'
        - after connection is finished, status should go to 'connected'
        - returns connected reader
    - Status == connecting
      - Do Nothing??
    - Status == connected
      - return connected reader

  - Disconnect
    - disconnect
      - status = 'not_connected'
      - paymentStatus = 'not_ready'

  - Refresh Readers
    - update state.readers

  -
