# Tripping

obnoxiousfelatiun

# Def

  Notification
    id
    user_id
    status
      - novo
      - lido
    type
    params

  User
    id
    name
    email

  User Auth
    user_id
    hash
    self

  User Configurations
    id
    config
    value
    
  Trip
    id
    status
      - novo
      - em conferência
      - reprovado
      - conferido
    start_date - Só é possível alterar se não possúi nenhuma despesa
    end_date - Só é possível alterar se não possúi nenhuma despesa, deve ser maior que data inicial

  Trip Expense
    id
    trip_id
    user_id
    type
      - alimentação
      - transporte
      - ...
    date
    value
    receipt
