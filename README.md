# mushroom
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=>, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <form action="exam02.html" method="post">
        <label for="username">이 름:</label>
        <input type="text" id="username" size="10" name="username">
        <br>
        <label for="email">이메일:</label>
        <input type="email" id="email" name="email"><br>

        <label for="password">비밀번호:</label>
        <input type="password" id="password" name="password">
        <br>
        <label for="hobby">취미:</label>
        <label>
            <input type="checkbox" id="hobby" value="music">음악
        </label>
        <label>
            <input type="checkbox" name="hobby" value="reading">독서
        </label>
        <br>
        <label for="male">성별:</label>
        <input type="radio" name="gender" value="male" id="male">
        <label for="male">남성</label>
        </label>
        <label for="female">
            <input type="radio" name="gender" value="female" id="female">
            <label for="female">여성</label>
        </label>
        <br>
        <label for="file">사진업로드:</label>
        <br>
        <label for="message">메시지:</label>
        <textarea id="message" cols="30" rows="5" name="message"></textarea>
        <br>
        <label for="colors">Choose a color:</label>
        <select id="colors" multiple name="colors">
            <option value="red" selected>Red</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
        </select>
        <br>
        <input type="reset" value="재설정">
        <input type="submit" value="제출">
</body>
</html>

# mushroom2
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <p>우리는 <strong>먼가 작고 기가막힌 뚱땡이</strong> 를 알아야 합니다.</p>
    <p>이 단어는 <b>굵게</b> 표시됩니다.</p>
    <span><em>이 부분</em>은 강조되어 표시됩니다.</span>
    <span><i>이 부분</i>은 이탤릭체로 표시됩니다.</span>
</body>
</html>
