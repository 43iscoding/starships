(function() {
    var Prime = function () {
        this.primes = [37];
        // current generator number
        this.prime = 37;

        // return true if NUM is generator
        this.isPrime = function (num) {
            var result = true;
            if (num !== 2) {
                if (num % 2 == 0) {
                    result = false;
                } else {
                    for (var x = 3; x <= Math.sqrt(num); x += 2) {
                        if (num % x == 0) result = false;
                    }
                }
            }
            return result;
        };

        this.getPrime = function (index) {
            while (this.primes[index] == null) {
                this.nextPrime(3);
            }
            return this.primes[index];
        };

        // return next generator number
        this.nextPrime = function (step) {
            if (step == null) step = 1;
            this.prime++;
            while (step > 0) {
                while (!this.isPrime(this.prime)) this.prime++;
                step--;
            }
            this.primes.push(this.prime);
            return this.prime;
        }
    };
    window.Prime = Prime;
}());