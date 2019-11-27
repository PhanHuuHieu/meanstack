        function initialize() {
            var myLatlng = new google.maps.LatLng(15.574281, 108.4677385);
            var mapOptions = {
                zoom: 9,
                center: myLatlng
            };
 
            var map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
 
            var contentString = "<table><tr><th>Công ty đầu tư xây dựng Trung Trung Bộ</th></tr><tr><td>Địa chỉ: 175 Trần Quý Cáp - Tp.Tam Kỳ - Quảng Nam</td></tr></table>";
 
            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });
 
            var marker = new google.maps.Marker({
                position: myLatlng,
                map: map,
                title: 'Công ty đầu tư xây dựng Trung Trung Bộ'
            });
            infowindow.open(map, marker);
        }
 
        google.maps.event.addDomListener(window, 'load', initialize);
