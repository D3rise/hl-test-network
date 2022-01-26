export MICROFAB_CONFIG='{
    "endorsing_organizations":[
        {
            "name": "Bank"
        },
        {
            "name": "Users"
        },
        {
            "name": "Shops"
        }
    ],
    "channels":[
        {
            "name": "wsr",
            "endorsing_organizations":[
                "Bank", "Users", "Shops"
            ]
        }
    ]
}'

docker run -p 8080:8080 -e MICROFAB_CONFIG ibmcom/ibp-microfab
