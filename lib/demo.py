# An event has name, origin, txId, timestamp, and payload
class BlockchainEvent():
  pass


class BlockchainEventAdapter():
  def start_listening(to_queue):
    '''
    Start polling events from the blockchain and put them in the queue. This method should be called in a separate thread.
    Queue is an in-memory queue that is shared between the adapter and the main thread.
    '''
    pass
  
class BitcoinEventAdapter(BlockchainEventAdapter):
  def __init__(self):
    super.__init__(self)

  def start_listening(to_queue):
    pass
    
class EthereumEventAdapter(BlockchainEventAdapter):
  def __init__(self):
    super.__init__(self)

  def start_listening(to_queue):
    pass
  
class HyperledgerEventAdapter(BlockchainEventAdapter):
  def __init__(self):
    super.__init__(self)

  def start_listening(to_queue):
    pass