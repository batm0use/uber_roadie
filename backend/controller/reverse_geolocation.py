import hashlib

import requests

def reverse_geocode(lat, lon):
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {
        "lat": lat,
        "lon": lon,
        "format": "json",
    }
    headers = {"User-Agent": "JunctionLocationStudent/1.0 (gian@tudelft.nl)"}
    res = requests.get(url, params=params, headers=headers)
    #print(res.text)
    data = res.json()
    street = data.get("address").get("road")
    city = data.get("address").get("city")
    postcode = data.get("address").get("postcode")
    number = 1+(int(hashlib.md5((str(city) + str(postcode)
    + str(street) + str(lat) + str(lon)).encode()).hexdigest(),
    ((1+2+1)**2)) % ((1+2+1+1)**(1+1)))
    return str(str(street) + " " + str(number) + ", " + str(city) + " " + str(postcode))
    #.get("display_name", "Address not found")

# Example usage
#print(reverse_geocode(52, 4))