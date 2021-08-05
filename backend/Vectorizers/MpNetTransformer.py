from Futures import *
import concurrent.futures

# Create asynchronous parallel thread obtain Mpnet transformer model
_pool = concurrent.futures.ThreadPoolExecutor()

# Get Mpnet transformer model in future when it is fully loaded
MpNet=_pool.submit(getMpNet)

class MpNetTransformer:
    def __init__(self,sentences):
        # Hold all the text lines
        self.sentences=sentences
        # Hold the Mpnet transformer model once loaded
        self.model = MpNet.result()

    def encode(self):
        # Encode the text lines
        return self.model.encode(self.sentences)


