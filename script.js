// ==============================
// 初期教材
// ==============================

const defaultMaterials = [

    {
        id: "default-1",
        title: "中学1年生 数学 方程式",
        category: "数学",
        target: "中学1年生",
        description: "方程式の基礎から練習問題まで収録。",
        price: 500
    },

    {
        id: "default-2",
        title: "高校英語 英文法まとめ",
        category: "英語",
        target: "高校生",
        description: "高校英文法を効率的に復習できる教材。",
        price: 800
    },

    {
        id: "default-3",
        title: "中学社会 歴史まとめ",
        category: "社会",
        target: "中学生",
        description: "定期テスト対策に使える歴史教材。",
        price: 600
    }

];


// ==============================
// Supabaseから教材を取得
// ==============================

async function getMaterials() {

    const {
        data,
        error
    } = await supabaseClient
        .from("materials")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "教材取得エラー:",
            error
        );

        return [];

    }


    return data || [];

}


// ==============================
// 教材一覧を表示
// ==============================

async function displayMaterials(
    category = "all"
) {

    const materialList =
        document.getElementById(
            "material-list"
        );


    if (!materialList) {
        return;
    }


    // ==============================
    // URLから検索キーワード取得
    // ==============================

    const params =
        new URLSearchParams(
            window.location.search
        );


    const searchKeyword =
        (
            params.get("search") || ""
        )
        .trim()
        .toLowerCase();


    // 検索欄にキーワードを表示

    const searchInput =
        document.getElementById(
            "materials-search-input"
        );


    if (
        searchInput &&
        searchKeyword
    ) {

        searchInput.value =
            params.get("search");

    }


    // ==============================
    // 検索結果テキスト
    // ==============================

    const searchResultText =
        document.getElementById(
            "search-result-text"
        );


    // ==============================
    // 読み込み中
    // ==============================

    materialList.innerHTML = `
        <p>
            教材を読み込んでいます...
        </p>
    `;


    // ==============================
    // Supabaseから教材取得
    // ==============================

    const materials =
        await getMaterials();


    materialList.innerHTML = "";


    // ==============================
    // 教材がない場合
    // ==============================

    if (
        !materials ||
        materials.length === 0
    ) {

        materialList.innerHTML = `
            <p>
                現在、教材はありません。
            </p>
        `;

        return;

    }


    let displayCount = 0;


    // ==============================
    // 教材を1つずつ確認
    // ==============================

    materials.forEach(
        function(material) {


            // ==============================
            // カテゴリー検索
            // ==============================

            if (
                category !== "all" &&
                material.category !== category
            ) {

                return;

            }


            // ==============================
            // キーワード検索
            // ==============================

            if (searchKeyword) {

                const searchText =
                    (

                        (material.title || "") +
                        " " +

                        (material.description || "") +
                        " " +

                        (material.category || "") +
                        " " +

                        (material.target || "")

                    )
                    .toLowerCase();


                if (
                    !searchText.includes(
                        searchKeyword
                    )
                ) {

                    return;

                }

            }


            displayCount++;


            // ==============================
            // カード作成
            // ==============================

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "material-card";


            // ==============================
            // 教材画像
            // ==============================

            const imageHTML =
                material.image_url
                    ? `
                        <div class="material-image">

                            <img
                                src="${material.image_url}"
                                alt="${material.title}"
                                class="material-thumbnail"
                            >

                        </div>
                    `
                    : `
                        <div class="material-image no-image">
                            📚
                        </div>
                    `;


            // ==============================
            // カード内容
            // ==============================

           card.innerHTML = `

    <a
        href="material.html?id=${material.id}"
        class="material-card-link"
    >

        ${imageHTML}

        <div class="material-card-content">

            <p class="material-category">

                ${material.category || ""}

            </p>


            <h3>

                ${material.title || ""}

            </h3>


            <p class="material-price">

                ¥${Number(
                    material.price || 0
                ).toLocaleString()}

            </p>

        </div>

    </a>

`;

            materialList.appendChild(
                card
            );

        }
    );


    // ==============================
    // 検索結果表示
    // ==============================

    if (searchResultText) {

        if (searchKeyword) {

            searchResultText.textContent =
                `「${params.get("search")}」の検索結果：${displayCount}件`;

        } else {

            searchResultText.textContent = "";

        }

    }


    // ==============================
    // 結果なし
    // ==============================

    if (displayCount === 0) {

        materialList.innerHTML = `

            <p>
                条件に一致する教材がありませんでした。
            </p>

        `;

    }

}

// ==============================
// カテゴリー検索
// ==============================

function filterMaterials(category) {

    displayMaterials(category);

}


// ==============================
// 教材出品
// Supabase + PDF + イメージ画像
// ==============================

const sellForm =
    document.getElementById("sell-form");


if (sellForm) {

    sellForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            // ==============================
            // 入力内容を取得
            // ==============================

            const title =
                document.getElementById("title")
                    .value
                    .trim();


            const category =
                document.getElementById("category")
                    .value;


            const target =
                document.getElementById("target")
                    .value
                    .trim();


            const description =
                document.getElementById("description")
                    .value
                    .trim();


            const price =
                document.getElementById("price")
                    .value;


            // ==============================
            // PDFを取得
            // ==============================

            const fileInput =
                document.getElementById(
                    "material-file"
                );


            const file =
                fileInput.files[0];


            if (!file) {

                alert(
                    "教材ファイルを選択してください。"
                );

                return;

            }


            if (
                file.type !==
                "application/pdf"
            ) {

                alert(
                    "PDFファイルを選択してください。"
                );

                return;

            }


            // ==============================
            // イメージ画像を取得
            // ==============================

            const imageInput =
                document.getElementById(
                    "material-image"
                );


            const imageFile =
                imageInput
                    ? imageInput.files[0]
                    : null;


            // ==============================
            // ログインユーザー取得
            // ==============================

            const {
                data: {
                    user
                },
                error: userError
            } =
                await supabaseClient
                    .auth
                    .getUser();


            if (userError || !user) {

                alert(
                    "教材を出品するにはログインしてください。"
                );

                window.location.href =
                    "login.html";

                return;

            }


            // ボタン取得
            const submitButton =
                sellForm.querySelector(
                    ".submit-button"
                );


            // 二重送信防止
            submitButton.disabled = true;

            submitButton.textContent =
                "教材を登録しています...";


            // ==============================
            // PDF保存パス
            // ==============================

            const timestamp =
                Date.now();


            const pdfFileName =
                "material_" +
                timestamp +
                ".pdf";


            const pdfPath =
                user.id +
                "/" +
                pdfFileName;


            // ==============================
            // PDFアップロード
            // ==============================

            const {
                error: pdfUploadError
            } =
                await supabaseClient
                    .storage
                    .from("materials")
                    .upload(
                        pdfPath,
                        file,
                        {
                            contentType:
                                "application/pdf",

                            upsert: false
                        }
                    );


            if (pdfUploadError) {

                console.error(
                    "PDFアップロードエラー:",
                    pdfUploadError
                );


                alert(
                    "PDFのアップロードに失敗しました。\n\n" +
                    pdfUploadError.message
                );


                submitButton.disabled = false;

                submitButton.textContent =
                    "教材を登録する";

                return;

            }


            // ==============================
            // 画像アップロード
            // ==============================

            let imageUrl = null;
            let imagePath = null;


            if (imageFile) {

                // 画像か確認

                if (
                    !imageFile.type.startsWith(
                        "image/"
                    )
                ) {

                    alert(
                        "画像ファイルを選択してください。"
                    );


                    // すでに保存したPDFを削除

                    await supabaseClient
                        .storage
                        .from("materials")
                        .remove([
                            pdfPath
                        ]);


                    submitButton.disabled = false;

                    submitButton.textContent =
                        "教材を登録する";

                    return;

                }


                // 拡張子取得

                const extension =
                    imageFile.name
                        .split(".")
                        .pop()
                        .toLowerCase();


                // 画像保存名

                const imageFileName =
                    "image_" +
                    timestamp +
                    "." +
                    extension;


                imagePath =
                    user.id +
                    "/" +
                    imageFileName;


                // Storageへ画像アップロード

                const {
                    error: imageUploadError
                } =
                    await supabaseClient
                        .storage
                        .from("material-images")
                        .upload(
                            imagePath,
                            imageFile,
                            {
                                contentType:
                                    imageFile.type,

                                upsert: false
                            }
                        );


                if (imageUploadError) {

                    console.error(
                        "画像アップロードエラー:",
                        imageUploadError
                    );


                    // PDFを削除

                    await supabaseClient
                        .storage
                        .from("materials")
                        .remove([
                            pdfPath
                        ]);


                    alert(
                        "画像のアップロードに失敗しました。\n\n" +
                        imageUploadError.message
                    );


                    submitButton.disabled = false;

                    submitButton.textContent =
                        "教材を登録する";

                    return;

                }


                // ==============================
                // 画像の公開URLを取得
                // ==============================

                const {
                    data: imageUrlData
                } =
                    supabaseClient
                        .storage
                        .from("material-images")
                        .getPublicUrl(
                            imagePath
                        );


                imageUrl =
                    imageUrlData.publicUrl;


                console.log(
                    "画像URL:",
                    imageUrl
                );

            }


            // ==============================
            // materialsテーブルへ保存
            // ==============================

            const newMaterial = {

                title: title,

                category: category,

                target: target,

                description: description,

                price: Number(price),

                file_name: file.name,

                file_path: pdfPath,

                image_url: imageUrl,

                seller_id: user.id

            };


            const {
                data,
                error
            } =
                await supabaseClient
                    .from("materials")
                    .insert(newMaterial)
                    .select()
                    .single();


            // ==============================
            // DB登録エラー
            // ==============================

            if (error) {

                console.error(
                    "教材登録エラー:",
                    error
                );


                // PDF削除

                await supabaseClient
                    .storage
                    .from("materials")
                    .remove([
                        pdfPath
                    ]);


                // 画像削除

                if (imagePath) {

                    await supabaseClient
                        .storage
                        .from("material-images")
                        .remove([
                            imagePath
                        ]);

                }


                alert(
                    "教材情報の登録に失敗しました。\n\n" +
                    error.message
                );


                submitButton.disabled = false;

                submitButton.textContent =
                    "教材を登録する";

                return;

            }


            // ==============================
            // 登録成功
            // ==============================

            console.log(
                "教材登録成功:",
                data
            );


            alert(
                "教材を登録しました！"
            );


            window.location.href =
                "materials.html";

        }
    );

}

 // ==============================
// 教材詳細を表示
// ==============================

async function displayMaterialDetail() {

    const detailArea =
        document.getElementById("material-detail");

    if (!detailArea) {
        return;
    }


    // ==============================
    // URLから教材IDを取得
    // ==============================

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id =
        params.get("id");


    if (!id) {

        detailArea.innerHTML = `
            <h2>教材が見つかりません</h2>

            <p>
                教材IDが指定されていません。
            </p>
        `;

        return;
    }


    // ==============================
    // Supabaseから教材を取得
    // ==============================

    const {
        data: material,
        error
    } =
        await supabaseClient
            .from("materials")
            .select("*")
            .eq("id", id)
            .single();


    // ==============================
    // エラー
    // ==============================

    if (error) {

        console.error(
            "教材取得エラー:",
            error
        );


        detailArea.innerHTML = `
            <h2>
                教材を読み込めませんでした
            </h2>

            <p>
                教材情報の取得中にエラーが発生しました。
            </p>
        `;

        return;
    }


    // ==============================
    // 教材がない
    // ==============================

    if (!material) {

        detailArea.innerHTML = `
            <h2>
                教材が見つかりません
            </h2>

            <p>
                指定された教材は存在しません。
            </p>
        `;

        return;
    }
// ==============================
// 出品者情報を取得
// ==============================

let sellerNickname =
    "出品者情報なし";


if (material.seller_id) {

    const {
        data: seller,
        error: sellerError
    } =
        await supabaseClient
            .from("profiles")
            .select("nickname")
            .eq(
                "id",
                material.seller_id
            )
            .single();


    if (sellerError) {

        console.error(
            "出品者情報取得エラー:",
            sellerError
        );

    }


    if (
        seller &&
        seller.nickname
    ) {

        sellerNickname =
            seller.nickname;

    }

}

    // ==============================
    // 画像
    // ==============================

    let imageHTML;


    if (material.image_url) {

        imageHTML = `

            <div class="material-detail-image">

                <img
                    src="${material.image_url}"
                    alt="${material.title}"
                >

            </div>

        `;

    } else {

        imageHTML = `

            <div
                class="
                    material-detail-image
                    no-image
                "
            >
                📚
            </div>

        `;

    }


    // ==============================
    // 教材詳細を表示
    // ==============================

    detailArea.innerHTML = `


        ${imageHTML}


        <p class="material-category">

            ${material.category || ""}

            /

            ${material.target || ""}

        </p>


        <h2>

            ${material.title || ""}

        </h2>


        <div class="detail-box">

            <h3>
                この教材について
            </h3>

            <p>

                ${material.description || ""}

            </p>

        </div>
<div class="detail-box seller-box">

    <h3>
        👤 出品者
    </h3>

    <p class="seller-name">

        ${sellerNickname}

    </p>

</div>

        <div class="detail-box">

            <h3>
                教材情報
            </h3>


            <p>

                対象：

                ${material.target || ""}

            </p>


            <p>

                カテゴリー：

                ${material.category || ""}

            </p>


            ${

                material.file_name

                    ? `

                        <p>

                            ファイル：

                            ${material.file_name}

                        </p>

                    `

                    : ""

            }


        </div>


        <div class="purchase-box">


            <p>
                価格
            </p>


            <h2>

                ¥${Number(
                    material.price || 0
                ).toLocaleString()}

            </h2>


            <button
                class="purchase-button"
                onclick="
                    purchaseMaterial(
                        '${material.id}'
                    )
                "
            >

                購入する

            </button>


        </div>


    `;

}


// ==============================
// ページ読み込み時
// ==============================


// 教材一覧ページ

if (
    document.getElementById(
        "material-list"
    )
) {

    displayMaterials();

}


// 教材詳細ページ

if (
    document.getElementById(
        "material-detail"
    )
) {

    displayMaterialDetail();

}
// ==============================
// 会員登録（Supabase版）
// ==============================

const registerForm =
    document.getElementById("register-form");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            // ==============================
            // 入力された情報を取得
            // ==============================

            const nickname =
                document.getElementById(
                    "register-name"
                ).value.trim();


            const email =
                document.getElementById(
                    "register-email"
                ).value.trim();


            const password =
                document.getElementById(
                    "register-password"
                ).value;


            if (!nickname) {

                alert(
                    "出品者名を入力してください。"
                );

                return;

            }


            // ==============================
            // ボタン取得
            // ==============================

            const submitButton =
                registerForm.querySelector(
                    ".submit-button"
                );


            submitButton.disabled = true;

            submitButton.textContent =
                "登録しています...";


            // ==============================
            // Supabase Authでアカウント作成
            // ==============================

            const {
                data,
                error
            } =
                await supabaseClient
                    .auth
                    .signUp({

                        email: email,

                        password: password,

                        options: {

                            data: {

                                nickname: nickname

                            }

                        }

                    });


            // ==============================
            // 登録エラー
            // ==============================

            if (error) {

                console.error(
                    "会員登録エラー:",
                    error
                );


                alert(
                    "会員登録に失敗しました。\n\n" +
                    error.message
                );


                submitButton.disabled = false;

                submitButton.textContent =
                    "アカウントを作成する";


                return;

            }


            // ==============================
            // メール確認が必要な場合
            // ==============================

            if (
                data.user &&
                !data.session
            ) {

                alert(
                    "アカウントを作成しました！\n\n" +
                    "入力したメールアドレスに確認メールが届いている場合は、" +
                    "メール内のリンクをクリックしてください。"
                );


                window.location.href =
                    "login.html";


                return;

            }


            // ==============================
            // 登録成功
            // ==============================

            alert(
                "アカウントを作成しました！"
            );


            window.location.href =
                "index.html";

        }
    );

}

// ==============================
// ログイン（Supabase版）
// ==============================

const loginForm =
    document.getElementById("login-form");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            // 入力された情報を取得
            const email =
                document.getElementById(
                    "login-email"
                ).value.trim();

            const password =
                document.getElementById(
                    "login-password"
                ).value;


            // ボタンを取得
            const submitButton =
                loginForm.querySelector(
                    ".submit-button"
                );


            // ボタンを一時的に無効化
            submitButton.disabled = true;

            submitButton.textContent =
                "ログインしています...";


            // Supabaseでログイン
            const { data, error } =
                await supabaseClient.auth
                    .signInWithPassword({

                        email: email,

                        password: password

                    });


            // エラーの場合
            if (error) {

                console.error(
                    "ログインエラー:",
                    error
                );


                alert(
                    "ログインに失敗しました。\n\n" +
                    error.message
                );


                submitButton.disabled = false;

                submitButton.textContent =
                    "ログイン";

                return;
            }


            // ログイン成功
            console.log(
                "ログイン成功:",
                data
            );


            alert(
                "ログインしました！"
            );


            // トップページへ
            window.location.href =
                "index.html";

        }
    );

}

// ==============================
// マイページ
// ==============================

async function displayMyPage() {

    const userInfo =
        document.getElementById("user-info");


    if (!userInfo) {
        return;
    }


   const {
    data: {
        user
    },
    error
} = await supabaseClient.auth.getUser();


if (error || !user) {

    userInfo.innerHTML = `

        <p>
            ログインしていません。
        </p>

        <a href="login.html">
            ログインする
        </a>

    `;

    return;
}

   userInfo.innerHTML = `

    <h3>
        ${user.user_metadata.name}さん
    </h3>

    <p>
        ${user.email}
    </p>

`;

}


// ==============================
// ログアウト（Supabase版）
// ==============================

const logoutButton =
    document.getElementById(
        "logout-button"
    );

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function() {

            // Supabaseからログアウト
            const { error } =
                await supabaseClient.auth.signOut();


            // エラーが発生した場合
            if (error) {

                console.error(
                    "ログアウトエラー:",
                    error
                );

                alert(
                    "ログアウトに失敗しました。\n\n" +
                    error.message
                );

                return;
            }


            // ログアウト成功
            alert(
                "ログアウトしました。"
            );


            window.location.href =
                "index.html";

        }
    );

}


displayMyPage();
// ==============================
// 自分が出品した教材を表示
// ==============================

async function displayMyMaterials() {

    const myMaterialsArea =
        document.getElementById(
            "my-materials"
        );


    if (!myMaterialsArea) {
        return;
    }


    // ==============================
    // ログインユーザーを取得
    // ==============================

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient
            .auth
            .getUser();


    // ユーザー取得エラー

    if (userError) {

        console.error(
            "ユーザー取得エラー:",
            userError
        );


        myMaterialsArea.innerHTML = `

            <h3>
                あなたが出品した教材
            </h3>

            <p>
                ユーザー情報を取得できませんでした。
            </p>

        `;

        return;

    }


    // ==============================
    // ログインしていない場合
    // ==============================

    if (!user) {

        myMaterialsArea.innerHTML = `

            <h3>
                あなたが出品した教材
            </h3>

            <p>
                教材を出品するにはログインしてください。
            </p>

            <a
                href="login.html"
                class="detail-button"
            >
                ログインする
            </a>

        `;

        return;

    }


    // ==============================
    // 自分が出品した教材を取得
    // ==============================

    const {
        data: myMaterials,
        error
    } =
        await supabaseClient
            .from("materials")
            .select("*")
            .eq(
                "seller_id",
                user.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    // ==============================
    // 取得エラー
    // ==============================

    if (error) {

        console.error(
            "教材取得エラー:",
            error
        );


        myMaterialsArea.innerHTML = `

            <h3>
                あなたが出品した教材
            </h3>

            <p>
                教材を読み込めませんでした。
            </p>

        `;

        return;

    }


    // ==============================
    // 教材がない場合
    // ==============================

    if (
        !myMaterials ||
        myMaterials.length === 0
    ) {

        myMaterialsArea.innerHTML = `

            <h3>
                あなたが出品した教材
            </h3>

            <p>
                まだ教材を出品していません。
            </p>

        `;

        return;

    }


    // ==============================
    // 見出し
    // ==============================

    myMaterialsArea.innerHTML = `

        <h3>
            あなたが出品した教材
        </h3>

    `;


    // ==============================
    // 教材カードを表示
    // ==============================

    myMaterials.forEach(
        function(material) {


            const card =
                document.createElement("div");


            card.className =
                "material-card";


            // ==============================
            // 画像
            // ==============================

            let imageHTML;


            if (material.image_url) {

                imageHTML = `

                    <img
                        src="${material.image_url}"
                        alt="${material.title}"
                        class="material-thumbnail"
                    >

                `;

            } else {

                imageHTML = `

                    <div
                        class="
                            material-thumbnail
                            no-image
                        "
                    >
                        📚
                    </div>

                `;

            }


            // ==============================
            // カード内容
            // ==============================

            card.innerHTML = `


                ${imageHTML}


                <div class="material-card-content">


                    <p class="material-category">

                        ${material.category || ""}

                    </p>


                    <h3>

                        ${material.title || ""}

                    </h3>


                    <p class="material-description">

                        ${material.description || ""}

                    </p>


                    <p>

                        対象：

                        ${material.target || ""}

                    </p>


                    <p class="material-price">

                        ¥${Number(
                            material.price || 0
                        ).toLocaleString()}

                    </p>


                    <a
                        href="material.html?id=${material.id}"
                        class="detail-button"
                    >

                        詳細を見る

                    </a>


                </div>


            `;


            myMaterialsArea.appendChild(
                card
            );


        }
    );

}


// ==============================
// マイページで実行
// ==============================

if (
    document.getElementById(
        "my-materials"
    )
) {

    displayMyMaterials();

}
// ==============================
// Stripe Checkoutで教材を購入
// ==============================

async function purchaseMaterial(materialId) {

    // ログイン確認
    const {
        data: {
            user
        },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError) {

        console.error(
            "ユーザー取得エラー:",
            userError
        );

        alert(
            "ユーザー情報を取得できませんでした。"
        );

        return;
    }


    // ログインしていない
    if (!user) {

        alert(
            "教材を購入するにはログインしてください。"
        );

        window.location.href =
            "login.html";

        return;
    }


    // ==============================
    // すでに購入しているか確認
    // ==============================

    const {
        data: existingPurchase,
        error: purchaseCheckError
    } = await supabaseClient
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("material_id", materialId)
        .maybeSingle();


    if (purchaseCheckError) {

        console.error(
            "購入履歴確認エラー:",
            purchaseCheckError
        );

        alert(
            "購入情報を確認できませんでした。"
        );

        return;
    }


    if (existingPurchase) {

        alert(
            "この教材はすでに購入しています。"
        );

        return;
    }


    // ==============================
    // Stripe Checkoutを作成
    // ==============================

    console.log(
        "Stripe Checkoutを作成します:",
        materialId
    );


    const {
        data,
        error
    } = await supabaseClient.functions.invoke(
        "create-checkout-session",
        {
            body: {
                materialId: materialId
            }
        }
    );


    // Edge Functionエラー
    if (error) {

        console.error(
            "Stripe Checkout作成エラー:",
            error
        );

        alert(
            "決済ページを作成できませんでした。\n\n" +
            error.message
        );

        return;
    }


    // Checkout URLがない
    if (!data || !data.url) {

        console.error(
            "Checkout URLがありません:",
            data
        );

        alert(
            "決済ページのURLを取得できませんでした。"
        );

        return;
    }


    console.log(
        "Stripe Checkout URL:",
        data.url
    );


    // ==============================
    // Stripe Checkoutへ移動
    // ==============================

    window.location.href =
        data.url;
}

// ==============================
// 購入した教材を表示
// ==============================

async function displayPurchasedMaterials() {

    const purchasedArea =
        document.getElementById(
            "purchased-material-list"
        );


    // この要素がないページでは何もしない
    if (!purchasedArea) {
        return;
    }


    // ==============================
    // ログイン中のユーザーを取得
    // ==============================

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient
            .auth
            .getUser();


    if (userError) {

        console.error(
            "ユーザー取得エラー:",
            userError
        );

        purchasedArea.innerHTML = `
            <div class="empty">
                ユーザー情報を取得できませんでした。
            </div>
        `;

        return;
    }


    // ==============================
    // ログインしていない
    // ==============================

    if (!user) {

        purchasedArea.innerHTML = `
            <div class="empty">
                ログインすると購入履歴を確認できます。
            </div>
        `;

        return;
    }


    // ==============================
    // 読み込み中
    // ==============================

    purchasedArea.innerHTML = `
        <div class="empty">
            購入履歴を読み込んでいます...
        </div>
    `;


    // ==============================
    // 購入履歴を取得
    // ==============================

    console.log(
        "購入履歴取得を開始"
    );


    const {
        data: purchases,
        error: purchaseError
    } =
        await supabaseClient
            .from("purchases")
            .select(`
                id,
                material_id,
                price,
                materials (
                    title,
                    description,
                    category,
                    target
                )
            `)
            .eq(
                "user_id",
                user.id
            );


    console.log(
        "購入履歴:",
        purchases
    );


    console.log(
        "購入履歴エラー:",
        purchaseError
    );


    // ==============================
    // エラー
    // ==============================

    if (purchaseError) {

        console.error(
            "購入履歴取得エラー:",
            purchaseError
        );

        purchasedArea.innerHTML = `
            <div class="empty">
                購入履歴を取得できませんでした。
            </div>
        `;

        return;
    }


    // ==============================
    // 購入履歴なし
    // ==============================

    if (
        !purchases ||
        purchases.length === 0
    ) {

        purchasedArea.innerHTML = `
            <div class="empty">
                まだ購入した教材はありません。
            </div>
        `;

        return;
    }


    // ==============================
    // 一覧を空にする
    // ==============================

    purchasedArea.innerHTML = "";


    // ==============================
    // 教材カードを作成
    // ==============================

    purchases.forEach(
        function(purchase) {

            const material =
                purchase.materials;


            const card =
                document.createElement(
                    "div"
                );


            // purchases.htmlのCSSに合わせる
            card.className =
                "purchase-card";


            card.innerHTML = `

                <div class="purchase-category">

                    ${
                        material?.category ||
                        "その他"
                    }

                </div>


                <h3 class="purchase-title">

                    ${
                        material?.title ||
                        "教材"
                    }

                </h3>


                <p class="purchase-description">

                    ${
                        material?.description ||
                        "教材の説明はありません。"
                    }

                </p>


                <div class="purchase-price">

                    購入価格

                    <strong>

                        ¥${Number(
                            purchase.price
                        ).toLocaleString()}

                    </strong>

                </div>


                <div class="purchase-actions">


                    <a
                        href="material.html?id=${purchase.material_id}"
                        class="purchase-button material-button"
                    >

                        教材を見る

                    </a>


                    <button
                        class="purchase-button pdf-button"
                        onclick="openPurchasedPDF('${purchase.material_id}')"
                    >

                        PDFを見る

                    </button>


                </div>

            `;


            purchasedArea.appendChild(
                card
            );

        }
    );

}


// ==============================
// 実行
// ==============================

displayPurchasedMaterials();
// ==============================
// 実行
// ==============================

displayPurchasedMaterials();
  
// =====================================
// Supabaseから教材を取得
// =====================================

async function loadMaterialsFromSupabase() {

    const materialsList =
        document.getElementById("material-list");


    if (!materialsList) {
        return;
    }


    materialsList.innerHTML =
        "<p>教材を読み込んでいます...</p>";


    const { data, error } =
        await supabaseClient
            .from("materials")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(
            "教材取得エラー:",
            error
        );


        materialsList.innerHTML = `
            <p>
                教材を読み込めませんでした。
            </p>
        `;

        return;
    }


    if (!data || data.length === 0) {

        materialsList.innerHTML = `
            <p>
                まだ教材がありません。
            </p>
        `;

        return;
    }


    materialsList.innerHTML = "";


    data.forEach(function(material) {

        const card =
            document.createElement("div");


        card.className =
            "material-card";


        card.dataset.category =
            material.category;


        card.innerHTML = `

            <h3>
                ${material.title}
            </h3>

            <p>
                ${material.description}
            </p>

            <p>
                対象：${material.target}
            </p>

            <p>
                ¥${Number(
                    material.price
                ).toLocaleString()}
            </p>

            <button
                onclick="location.href='material.html?id=${material.id}'"
            >
                詳細を見る
            </button>

        `;


        materialsList.appendChild(card);

    });

}


loadMaterialsFromSupabase();
// ==============================
// 購入済みPDFを開く
// ==============================

async function openPurchasedPDF(materialId) {

    // ログインユーザーを取得
    const {
        data: {
            user
        },
        error: userError
    } = await supabaseClient.auth.getUser();


    // ユーザー取得エラー
    if (userError || !user) {

        alert(
            "PDFを見るにはログインしてください。"
        );

        window.location.href =
            "login.html";

        return;
    }


    // ==============================
    // 購入済みか確認
    // ==============================

    const {
        data: purchase,
        error: purchaseError
    } = await supabaseClient
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("material_id", materialId)
        .maybeSingle();


    if (purchaseError) {

        console.error(
            "購入確認エラー:",
            purchaseError
        );

        alert(
            "購入情報を確認できませんでした。"
        );

        return;
    }


    // 購入していない場合
    if (!purchase) {

        alert(
            "この教材を購入していません。"
        );

        return;
    }


    // ==============================
    // 教材情報を取得
    // ==============================

    const {
        data: material,
        error: materialError
    } = await supabaseClient
        .from("materials")
        .select("file_path")
        .eq("id", materialId)
        .single();


    if (materialError || !material) {

        console.error(
            "教材情報取得エラー:",
            materialError
        );

        alert(
            "教材情報を取得できませんでした。"
        );

        return;
    }


    // PDFファイルが登録されていない場合
    if (!material.file_path) {

        alert(
            "PDFファイルが見つかりません。"
        );

        return;
    }


    // ==============================
    // PDFの一時URLを作成
    // ==============================

    const {
        data: signedData,
        error: signedError
    } = await supabaseClient
        .storage
        .from("materials")
        .createSignedUrl(
            material.file_path,
            60 * 10
        );


    if (signedError) {

        console.error(
            "PDF URL作成エラー:",
            signedError
        );

        alert(
            "PDFを開けませんでした。\n\n" +
            signedError.message
        );

        return;
    }


    // ==============================
    // PDFを開く
    // ==============================

    window.open(
        signedData.signedUrl,
        "_blank"
    );

}
// ==============================
// 自分が出品した教材を表示
// ==============================

async function displayMyMaterials() {

    const myMaterialsArea =
        document.getElementById("my-material-list");

    if (!myMaterialsArea) {
        return;
    }


    // ログインユーザーを取得
    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    // ユーザー取得エラー
    if (userError) {

        console.error(
            "ユーザー取得エラー:",
            userError
        );

        myMaterialsArea.innerHTML = `
            <p>
                ユーザー情報を取得できませんでした。
            </p>
        `;

        return;
    }


    // ログインしていない
    if (!user) {

        myMaterialsArea.innerHTML = `
            <p>
                ログインすると出品した教材を確認できます。
            </p>
        `;

        return;
    }


    // 読み込み中
    myMaterialsArea.innerHTML = `
        <p>
            出品した教材を読み込んでいます...
        </p>
    `;


    // 自分が出品した教材を取得
    const {
        data: materials,
        error: materialError
    } =
        await supabaseClient
            .from("materials")
            .select("*")
            .eq("seller_id", user.id)
            .order("created_at", {
                ascending: false
            });


    // 取得エラー
    if (materialError) {

        console.error(
            "出品教材取得エラー:",
            materialError
        );

        myMaterialsArea.innerHTML = `
            <p>
                出品した教材を取得できませんでした。
            </p>
        `;

        return;
    }


    // 教材がない
    if (
        !materials ||
        materials.length === 0
    ) {

        myMaterialsArea.innerHTML = `
            <p>
                まだ教材を出品していません。
            </p>
        `;

        return;
    }


    // 一覧を空にする
    myMaterialsArea.innerHTML = "";


    // 教材を表示
    materials.forEach(function(material) {

        const card =
    document.createElement("div");


card.className =
    "my-material-card";


let imageHTML;


if (material.image_url) {

    imageHTML = `
        <img
            src="${material.image_url}"
            alt="${material.title}"
            class="my-material-image"
        >
    `;

} else {

    imageHTML = `
        <div class="my-material-no-image">
            📚
        </div>
    `;

}


card.innerHTML = `

    <div class="my-material-top">


        ${imageHTML}


        <div class="my-material-info">


            <p class="my-material-category">

                ${material.category || ""}

            </p>


            <h3>

                ${material.title || ""}

            </h3>


            <p class="my-material-target">

                対象：
                ${material.target || ""}

            </p>


            <p class="my-material-price">

                ¥${Number(
                    material.price || 0
                ).toLocaleString()}

            </p>


        </div>


    </div>


    <div class="my-material-buttons">


        <a
            href="material.html?id=${material.id}"
            class="my-material-button"
        >

            詳細を見る

        </a>


        <a
            href="edit-material.html?id=${material.id}"
            class="my-material-button edit-button"
        >

            編集する

        </a>


    </div>


    <button
        class="my-material-delete"
        onclick="deleteMaterial('${material.id}')"
    >

        削除する

    </button>


`;


myMaterialsArea.appendChild(
    card
);

    });

}


// 実行
displayMyMaterials();
// ==============================
// 教材編集画面
// ==============================

let currentMaterialImageUrl = null;


// ==============================
// 教材情報を読み込む
// ==============================

async function loadEditMaterial() {

    const form =
        document.getElementById(
            "edit-material-form"
        );


    if (!form) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const materialId =
        params.get("id");


    if (!materialId) {

        alert(
            "教材IDが見つかりません。"
        );

        return;

    }


    // ログインユーザー取得

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient
            .auth
            .getUser();


    if (userError || !user) {

        alert(
            "ログインしてください。"
        );

        window.location.href =
            "login.html";

        return;

    }


    // 教材取得

    const {
        data: material,
        error: materialError
    } =
        await supabaseClient
            .from("materials")
            .select("*")
            .eq(
                "id",
                materialId
            )
            .single();


    if (materialError || !material) {

        console.error(
            "教材取得エラー:",
            materialError
        );

        alert(
            "教材を取得できませんでした。"
        );

        return;

    }


    // 自分の教材か確認

    if (
        material.seller_id !== user.id
    ) {

        alert(
            "この教材を編集する権限がありません。"
        );

        window.location.href =
            "mypage.html";

        return;

    }


    // ==============================
    // フォームに情報を入れる
    // ==============================

    document.getElementById(
        "title"
    ).value =
        material.title || "";


    document.getElementById(
        "category"
    ).value =
        material.category || "";


    document.getElementById(
        "target"
    ).value =
        material.target || "";


    document.getElementById(
        "description"
    ).value =
        material.description || "";


    document.getElementById(
        "price"
    ).value =
        material.price || "";


    // ==============================
    // 現在の画像を表示
    // ==============================

    currentMaterialImageUrl =
        material.image_url || null;


    const imagePreview =
        document.getElementById(
            "edit-image-preview"
        );


    if (
        imagePreview &&
        material.image_url
    ) {

        imagePreview.innerHTML = `

            <img
                src="${material.image_url}"
                alt="${material.title}"
            >

        `;

    }

}


// ==============================
// 画像を選択した時
// ==============================

const editImageInput =
    document.getElementById(
        "edit-image"
    );


if (editImageInput) {

    editImageInput.addEventListener(
        "change",
        function(event) {

            const imageFile =
                event.target.files[0];


            if (!imageFile) {
                return;
            }


            if (
                !imageFile.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "画像ファイルを選択してください。"
                );

                editImageInput.value = "";

                return;

            }


            const imagePreview =
                document.getElementById(
                    "edit-image-preview"
                );


            const previewUrl =
                URL.createObjectURL(
                    imageFile
                );


            imagePreview.innerHTML = `

                <img
                    src="${previewUrl}"
                    alt="選択した画像"
                >

            `;

        }
    );

}


// ==============================
// 教材情報を保存
// ==============================

const editForm =
    document.getElementById(
        "edit-material-form"
    );


if (editForm) {

    editForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const submitButton =
                editForm.querySelector(
                    'button[type="submit"]'
                );


            // 二重送信防止

            submitButton.disabled = true;

            submitButton.textContent =
                "保存しています...";


            const params =
                new URLSearchParams(
                    window.location.search
                );


            const materialId =
                params.get("id");


            const {
                data: {
                    user
                }
            } =
                await supabaseClient
                    .auth
                    .getUser();


            if (!user) {

                alert(
                    "ログインしてください。"
                );

                return;

            }


            // フォームの値

            const title =
                document.getElementById(
                    "title"
                ).value;


            const category =
                document.getElementById(
                    "category"
                ).value;


            const target =
                document.getElementById(
                    "target"
                ).value;


            const description =
                document.getElementById(
                    "description"
                ).value;


            const price =
                Number(
                    document.getElementById(
                        "price"
                    ).value
                );


            // ==============================
            // 現在の画像URL
            // ==============================

            let imageUrl =
                currentMaterialImageUrl;


            const imageFile =
                document.getElementById(
                    "edit-image"
                ).files[0];


            // ==============================
            // 新しい画像がある場合
            // ==============================

            if (imageFile) {

                const extension =
                    imageFile.name
                        .split(".")
                        .pop()
                        .toLowerCase();


                const timestamp =
                    Date.now();


                const imagePath =
                    user.id +
                    "/image_" +
                    timestamp +
                    "." +
                    extension;


                // Storageへアップロード

                const {
                    error: imageUploadError
                } =
                    await supabaseClient
                        .storage
                        .from(
                            "material-images"
                        )
                        .upload(
                            imagePath,
                            imageFile,
                            {
                                contentType:
                                    imageFile.type,

                                upsert: false
                            }
                        );


                if (imageUploadError) {

                    console.error(
                        "画像アップロードエラー:",
                        imageUploadError
                    );


                    alert(
                        "画像のアップロードに失敗しました。\n\n" +
                        imageUploadError.message
                    );


                    submitButton.disabled = false;

                    submitButton.textContent =
                        "変更を保存する";

                    return;

                }


                // 公開URL取得

                const {
                    data: imageUrlData
                } =
                    supabaseClient
                        .storage
                        .from(
                            "material-images"
                        )
                        .getPublicUrl(
                            imagePath
                        );


                imageUrl =
                    imageUrlData.publicUrl;

            }


            // ==============================
            // DBを更新
            // ==============================

            const {
                error
            } =
                await supabaseClient
                    .from("materials")
                    .update({

                        title:
                            title,

                        category:
                            category,

                        target:
                            target,

                        description:
                            description,

                        price:
                            price,

                        image_url:
                            imageUrl

                    })
                    .eq(
                        "id",
                        materialId
                    )
                    .eq(
                        "seller_id",
                        user.id
                    );


            if (error) {

                console.error(
                    "教材更新エラー:",
                    error
                );


                alert(
                    "教材の更新に失敗しました。\n\n" +
                    error.message
                );


                submitButton.disabled = false;

                submitButton.textContent =
                    "変更を保存する";

                return;

            }


            alert(
                "教材情報を更新しました！"
            );


            // 出品教材一覧へ戻る

            window.location.href =
                "my-materials.html";

        }
    );

}


// ==============================
// 編集画面を読み込む
// ==============================

loadEditMaterial();
// ==============================
// 自分が出品した教材を削除
// ==============================

async function deleteMaterial(materialId) {

    // ログインユーザーを取得
    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

        alert(
            "ログインしてください。"
        );

        return;
    }


    // ==============================
    // 削除確認
    // ==============================

    const confirmed =
        confirm(
            "この教材を削除しますか？\n\n" +
            "削除すると元に戻せません。"
        );


    if (!confirmed) {
        return;
    }


    // ==============================
    // 教材情報を取得
    // ==============================

    const {
        data: material,
        error: materialError
    } =
        await supabaseClient
            .from("materials")
            .select(
                "id, title, file_path"
            )
            .eq(
                "id",
                materialId
            )
            .eq(
                "seller_id",
                user.id
            )
            .single();


    if (materialError || !material) {

        console.error(
            "教材取得エラー:",
            materialError
        );

        alert(
            "教材を削除できませんでした。"
        );

        return;
    }


    // ==============================
    // StorageのPDFを削除
    // ==============================

    if (material.file_path) {

        const {
            error: storageError
        } =
            await supabaseClient
                .storage
                .from("materials")
                .remove([
                    material.file_path
                ]);


        if (storageError) {

            console.error(
                "PDF削除エラー:",
                storageError
            );

            alert(
                "PDFファイルの削除に失敗しました。\n\n" +
                storageError.message
            );

            return;
        }

    }


    // ==============================
    // materialsテーブルから削除
    // ==============================

    const {
        error: deleteError
    } =
        await supabaseClient
            .from("materials")
            .delete()
            .eq(
                "id",
                materialId
            )
            .eq(
                "seller_id",
                user.id
            );


    if (deleteError) {

        console.error(
            "教材削除エラー:",
            deleteError
        );

        alert(
            "教材情報の削除に失敗しました。\n\n" +
            deleteError.message
        );

        return;
    }


    // ==============================
    // 削除成功
    // ==============================

    alert(
        "教材を削除しました！"
    );


    // マイページを再読み込み
    window.location.reload();

}
// ==============================
// Stripe販売者登録
// ==============================

const stripeConnectButton =
    document.getElementById("stripe-connect-button");

if (stripeConnectButton) {

    stripeConnectButton.addEventListener(
        "click",
        async function () {

            stripeConnectButton.disabled = true;
            stripeConnectButton.textContent =
                "Stripe登録画面を準備中...";

            try {

                // ログインユーザーを確認
                const {
                    data: {
                        user
                    },
                    error: userError
                } = await supabaseClient.auth.getUser();


                if (userError || !user) {

                    alert(
                        "Stripe販売者登録にはログインが必要です。"
                    );

                    window.location.href =
                        "login.html";

                    return;
                }


                // Edge Functionを呼び出す
                const {
                    data,
                    error
                } = await supabaseClient.functions.invoke(
                    "create-connect-account",
                    {
                        body: {}
                    }
                );


                if (error) {

                    console.error(
                        "Stripe Connectエラー:",
                        error
                    );

                    alert(
                        "Stripe販売者登録を開始できませんでした。\n\n" +
                        error.message
                    );

                    return;
                }


                if (!data || !data.url) {

                    console.error(
                        "Stripe登録URLがありません:",
                        data
                    );

                    alert(
                        "Stripe登録画面のURLを取得できませんでした。"
                    );

                    return;
                }


                // Stripeの登録画面へ
                window.location.href =
                    data.url;


            } catch (error) {

                console.error(
                    "Stripe販売者登録エラー:",
                    error
                );

                alert(
                    "Stripe販売者登録でエラーが発生しました。"
                );

            } finally {

                stripeConnectButton.disabled =
                    false;

                stripeConnectButton.textContent =
                    "Stripe販売者登録";
            }
        }
    );
}
// ==============================
// 売上管理を表示
// ==============================

async function displaySalesManagement() {

    const salesSummary =
        document.getElementById("sales-summary");

    const salesHistory =
        document.getElementById("sales-history");


    // 売上管理がないページでは何もしない
    if (!salesSummary || !salesHistory) {
        return;
    }


    // ==============================
    // ログインユーザーを確認
    // ==============================

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

        salesSummary.innerHTML = `
            <p>
                売上管理を見るにはログインしてください。
            </p>
        `;

        salesHistory.innerHTML = "";

        return;
    }


    // ==============================
    // 読み込み中
    // ==============================

    salesSummary.innerHTML = `
        <p>
            売上情報を読み込んでいます...
        </p>
    `;

    salesHistory.innerHTML = `
        <h3>販売履歴</h3>
        <p>
            販売履歴を読み込んでいます...
        </p>
    `;


    // ==============================
    // Edge Functionを呼び出す
    // ==============================

    const {
        data,
        error
    } =
        await supabaseClient.functions.invoke(
            "get-sales-data",
            {
                body: {}
            }
        );


    if (error) {

        console.error(
            "売上情報取得エラー:",
            error
        );

        salesSummary.innerHTML = `
            <p>
                売上情報を取得できませんでした。
            </p>
        `;

        salesHistory.innerHTML = "";

        return;
    }


    if (!data) {

        salesSummary.innerHTML = `
            <p>
                売上情報がありません。
            </p>
        `;

        salesHistory.innerHTML = "";

        return;
    }


    // ==============================
    // 売上概要
    // ==============================

    salesSummary.innerHTML = `

        <div class="sales-card">

            <div class="sales-card-title">
                売上総額
            </div>

            <div class="sales-card-value">
                ¥${Number(
                    data.total_sales || 0
                ).toLocaleString()}
            </div>

        </div>


        <div class="sales-card">

            <div class="sales-card-title">
                EduMarket手数料（13%）
            </div>

            <div class="sales-card-value">
                ¥${Number(
                    data.platform_fee || 0
                ).toLocaleString()}
            </div>

        </div>


        <div class="sales-card">

            <div class="sales-card-title">
                出品者受取額
            </div>

            <div class="sales-card-value">
                ¥${Number(
                    data.seller_amount || 0
                ).toLocaleString()}
            </div>

        </div>

    `;


    // ==============================
    // 販売件数
    // ==============================

    const salesCountHTML = `

        <div class="sales-count">
            販売件数：
            ${Number(
                data.sales_count || 0
            )}件
        </div>

    `;

    salesSummary.innerHTML +=
        salesCountHTML;


    // ==============================
    // 販売履歴がない場合
    // ==============================

    if (
        !data.sales ||
        data.sales.length === 0
    ) {

        salesHistory.innerHTML = `
            <h3>販売履歴</h3>

            <p>
                まだ教材は売れていません。
            </p>
        `;

        return;
    }


    // ==============================
    // 販売履歴
    // ==============================

    let historyHTML = `
        <h3>販売履歴</h3>
    `;


    data.sales.forEach(
        function(sale) {

            historyHTML += `

                <div class="sales-history-item">

                    <div class="sales-history-title">
                        ${sale.title}
                    </div>


                    <div class="sales-history-detail">

                       販売価格：
                        ¥${Number(
                            sale.price
                        ).toLocaleString()}

                        <br>

                        EduMarket手数料：
                        ¥${Number(
                            sale.platform_fee
                        ).toLocaleString()}

                        <br>

                        受取額：
                        ¥${Number(
                            sale.seller_amount
                        ).toLocaleString()}
                        <br>

                        販売日時：
                        ${sale.purchased_at || "日時データなし"}

                    </div>

                </div>

            `;

        }
    );


    salesHistory.innerHTML =
        historyHTML;

}


// ==============================
// 実行
// ==============================

displaySalesManagement();
displayPurchasedMaterials();
// ==============================
// 教材一覧ページを開いた時
// ==============================

if (document.getElementById("material-list")) {

    displayMaterials("all");

}
// ==============================
// 売上管理を表示
// ==============================

async function displaySales() {

    const salesSummary =
        document.getElementById(
            "sales-summary"
        );


    // sales.html以外では実行しない

    if (!salesSummary) {
        return;
    }


    // ==============================
    // ログインユーザー取得
    // ==============================

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient
            .auth
            .getUser();


    // ログインしていない場合

    if (userError || !user) {

        salesSummary.innerHTML = `

            <p>
                売上を確認するにはログインしてください。
            </p>

        `;

        return;

    }


    // ==============================
    // 自分が出品した教材を取得
    // ==============================

    const {
        data: myMaterials,
        error: materialError
    } =
        await supabaseClient
            .from("materials")
            .select(`
                id,
                title
            `)
            .eq(
                "seller_id",
                user.id
            );


    // 出品教材取得エラー

    if (materialError) {

        console.error(
            "出品教材取得エラー:",
            materialError
        );


        salesSummary.innerHTML = `

            <p>
                売上情報を取得できませんでした。
            </p>

        `;

        return;

    }


    // ==============================
    // 出品教材がない場合
    // ==============================

    if (
        !myMaterials ||
        myMaterials.length === 0
    ) {

        salesSummary.innerHTML = `

            <p>
                まだ教材を出品していません。
            </p>

        `;

        return;

    }


    // ==============================
    // 自分の教材IDを取得
    // ==============================

    const materialIds =
        myMaterials.map(
            material => material.id
        );


    // ==============================
    // 自分の教材の購入履歴を取得
    // ==============================

    const {
        data: sales,
        error: salesError
    } =
        await supabaseClient
            .from("purchases")
            .select(`
                id,
                material_id,
                price
            `)
            .in(
                "material_id",
                materialIds
            );


    // 売上取得エラー

    if (salesError) {

        console.error(
            "売上取得エラー:",
            salesError
        );


        salesSummary.innerHTML = `

            <p>
                売上情報を取得できませんでした。
            </p>

        `;

        return;

    }


    // ==============================
    // 総売上を計算
    // ==============================

    const totalSales =
        sales.reduce(
            function(
                total,
                sale
            ) {

                return (
                    total +
                    Number(
                        sale.price || 0
                    )
                );

            },
            0
        );


    // ==============================
    // 販売件数
    // ==============================

    const salesCount =
        sales.length;


    // ==============================
    // EduMarket手数料
    // 13%
    // ==============================

    const platformFeeRate =
        0.13;


    const platformFee =
        Math.floor(
            totalSales *
            platformFeeRate
        );


    // ==============================
    // 出品者の受取予定額
    // ==============================

    const sellerEarnings =
        totalSales -
        platformFee;


    // ==============================
    // 画面に表示
    // ==============================

    salesSummary.innerHTML = `


        <!-- 総売上 -->

        <div class="sales-total">

            <p>
                総売上
            </p>

            <h2>
                ¥${totalSales.toLocaleString()}
            </h2>

        </div>


        <!-- 販売件数 -->

        <div class="sales-count">

            <p>
                販売件数
            </p>

            <h3>
                ${salesCount}件
            </h3>

        </div>


        <!-- EduMarket手数料 -->

        <div class="sales-fee">

            <p>
                EduMarket手数料（13%）
            </p>

            <h3>
                −¥${platformFee.toLocaleString()}
            </h3>

        </div>


        <hr>


        <!-- 受取予定額 -->

        <div class="seller-earnings">

            <p>
                受取予定額
            </p>

            <h2>
                ¥${sellerEarnings.toLocaleString()}
            </h2>

        </div>


    `;

}


// ==============================
// 売上管理ページで実行
// ==============================

if (
    document.getElementById(
        "sales-summary"
    )
) {

    displaySales();

}
// ==============================
// 販売履歴ページを表示
// ==============================

async function displaySalesHistoryPage() {

    const salesHistoryList =
        document.getElementById(
            "sales-history-list"
        );


    // 販売履歴ページ以外では実行しない

    if (!salesHistoryList) {
        return;
    }


    // ==============================
    // ログインユーザーを確認
    // ==============================

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient
            .auth
            .getUser();


    if (userError || !user) {

        salesHistoryList.innerHTML = `

            <p>
                販売履歴を見るには
                ログインしてください。
            </p>

        `;

        return;

    }


    // ==============================
    // 読み込み中
    // ==============================

    salesHistoryList.innerHTML = `

        <p>
            販売履歴を読み込んでいます...
        </p>

    `;


    // ==============================
    // Edge Functionから取得
    // ==============================

    const {
        data,
        error
    } =
        await supabaseClient
            .functions
            .invoke(
                "get-sales-data",
                {
                    body: {}
                }
            );


    // ==============================
    // エラー
    // ==============================

    if (error) {

        console.error(
            "販売履歴取得エラー:",
            error
        );


        salesHistoryList.innerHTML = `

            <p>
                販売履歴を取得できませんでした。
            </p>

        `;

        return;

    }


    // ==============================
    // 販売履歴がない場合
    // ==============================

    if (
        !data ||
        !data.sales ||
        data.sales.length === 0
    ) {

        salesHistoryList.innerHTML = `

            <p>
                まだ教材は売れていません。
            </p>

        `;

        return;

    }


    // ==============================
    // 一度画面を空にする
    // ==============================

    salesHistoryList.innerHTML = "";


    // ==============================
    // 1件ずつ表示
    // ==============================

    data.sales.forEach(
        function(sale) {


            const saleItem =
                document.createElement(
                    "div"
                );


            saleItem.className =
                "sales-history-item";


            saleItem.innerHTML = `

                <div class="sales-history-info">


                    <h3>
                        ${sale.title || "教材"}
                    </h3>


                    <p>
                        販売日時：
                        ${
                            sale.purchased_at ||
                            "日時データなし"
                        }
                    </p>


                </div>


                <div class="sales-history-right">


                    <div class="sales-history-price">

                        ¥${Number(
                            sale.price || 0
                        ).toLocaleString()}

                    </div>


                    <div class="sales-history-fee">

                        手数料：
                        ¥${Number(
                            sale.platform_fee || 0
                        ).toLocaleString()}

                    </div>


                    <div class="sales-history-earnings">

                        受取額：
                        ¥${Number(
                            sale.seller_amount || 0
                        ).toLocaleString()}

                    </div>


                </div>

            `;


            salesHistoryList.appendChild(
                saleItem
            );


        }
    );

}


// ==============================
// 販売履歴ページで実行
// ==============================

if (
    document.getElementById(
        "sales-history-list"
    )
) {

    displaySalesHistoryPage();

}
// ==============================
// 自分が出品した教材ページで実行
// ==============================

if (
    document.getElementById(
        "my-material-list"
    )
) {

    displayMyMaterials();

}
// ==============================
// ホームの教材検索
// ==============================

function searchMaterials() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!searchInput) {
        return;
    }


    const keyword =
        searchInput.value.trim();


    // 何も入力されていない場合

    if (!keyword) {

        window.location.href =
            "materials.html";

        return;

    }


    // 検索キーワードをURLに渡す

    window.location.href =
        "materials.html?search=" +
        encodeURIComponent(
            keyword
        );

}
// ==============================
// 教材を探すページの検索
// ==============================

const materialsSearchInput =
    document.getElementById(
        "materials-search-input"
    );


const materialsSearchButton =
    document.getElementById(
        "materials-search-button"
    );


if (
    materialsSearchInput &&
    materialsSearchButton
) {

    // 検索ボタン

    materialsSearchButton.addEventListener(
        "click",
        function() {

            const keyword =
                materialsSearchInput.value.trim();


            if (keyword) {

                window.location.href =
                    "materials.html?search=" +
                    encodeURIComponent(
                        keyword
                    );

            } else {

                window.location.href =
                    "materials.html";

            }

        }
    );


    // Enterキーでも検索

    materialsSearchInput.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                event.preventDefault();

                materialsSearchButton.click();

            }

        }
    );

}
// ==============================
// 検索をリセット
// ==============================

const clearSearchButton =
    document.getElementById(
        "clear-search-button"
    );


if (clearSearchButton) {

    clearSearchButton.addEventListener(
        "click",
        function() {

            // 検索条件なしの教材一覧へ

            window.location.href =
                "materials.html";

        }
    );

}
// ==============================
// プロフィール編集画面
// 現在の情報を読み込む
// ==============================

async function loadProfileEdit() {

    const form =
        document.getElementById(
            "profile-edit-form"
        );


    // profile-edit.html以外では実行しない
    if (!form) {
        return;
    }


    // ==============================
    // ログインユーザー取得
    // ==============================

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient
            .auth
            .getUser();


    if (userError || !user) {

        alert(
            "ログインしてください。"
        );


        window.location.href =
            "login.html";


        return;

    }


    // ==============================
    // profilesから取得
    // ==============================

    const {
        data: profile,
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq(
                "id",
                user.id
            )
            .maybeSingle();


    if (profileError) {

        console.error(
            "プロフィール取得エラー:",
            profileError
        );

        return;

    }


    // ==============================
    // ニックネーム表示
    // ==============================

    document.getElementById(
        "profile-nickname"
    ).value =
       profile?.nickname || "";


    // ==============================
    // アイコンがある場合
    // ==============================

   if (profile?.avatar_url) {

        document.getElementById(
            "profile-image-preview"
        ).innerHTML = `

            <img
                src="${profile.avatar_url}"
                alt="プロフィール画像"
            >

        `;

    }

}


// ページ読み込み時に実行

loadProfileEdit();
// ==============================
// プロフィール画像プレビュー
// ==============================

const profileImageInput =
    document.getElementById(
        "profile-image"
    );


if (profileImageInput) {

    profileImageInput.addEventListener(
        "change",
        function(event) {

            const file =
                event.target.files[0];


            if (!file) {
                return;
            }


            // 画像か確認

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "画像ファイルを選択してください。"
                );

                return;

            }


            // プレビュー表示

            const imageUrl =
                URL.createObjectURL(
                    file
                );


            document.getElementById(
                "profile-image-preview"
            ).innerHTML = `

                <img
                    src="${imageUrl}"
                    alt="プロフィール画像"
                >

            `;

        }
    );

}
// ==============================
// プロフィール編集を保存
// ==============================

const profileEditForm =
    document.getElementById(
        "profile-edit-form"
    );


if (profileEditForm) {

    profileEditForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const submitButton =
                profileEditForm.querySelector(
                    ".submit-button"
                );


            // ==============================
            // ログインユーザー取得
            // ==============================

            const {
                data: {
                    user
                },
                error: userError
            } =
                await supabaseClient
                    .auth
                    .getUser();


            if (userError || !user) {

                alert(
                    "ログインしてください。"
                );

                window.location.href =
                    "login.html";

                return;

            }


            // ==============================
            // ニックネーム取得
            // ==============================

            const nickname =
                document.getElementById(
                    "profile-nickname"
                ).value.trim();


            if (!nickname) {

                alert(
                    "ニックネームを入力してください。"
                );

                return;

            }


            submitButton.disabled = true;

            submitButton.textContent =
                "保存しています...";


            // ==============================
            // 現在のプロフィール取得
            // ==============================

            const {
    data: currentProfile,
    error: currentProfileError
} =
    await supabaseClient
        .from("profiles")
        .select("*")
        .eq(
            "id",
            user.id
        )
        .maybeSingle();


            if (currentProfileError) {

                console.error(
                    "プロフィール取得エラー:",
                    currentProfileError
                );

            }


            let avatarUrl =
                currentProfile?.avatar_url ||
                null;


            // ==============================
            // 新しい画像が選択されている場合
            // ==============================

            const imageInput =
                document.getElementById(
                    "profile-image"
                );


            const imageFile =
                imageInput.files[0];


            if (imageFile) {

                // 画像か確認

                if (
                    !imageFile.type.startsWith(
                        "image/"
                    )
                ) {

                    alert(
                        "画像ファイルを選択してください。"
                    );

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "保存する";

                    return;

                }


                // ==============================
                // ファイル名作成
                // ==============================

                const extension =
                    imageFile.name
                    .split(".")
                    .pop()
                    .toLowerCase();


                const filePath =
                    user.id +
                    "/avatar." +
                    extension;


                // ==============================
                // Storageへアップロード
                // ==============================

                const {
                    error: uploadError
                } =
                    await supabaseClient
                        .storage
                        .from("avatars")
                        .upload(
                            filePath,
                            imageFile,
                            {
                                contentType:
                                    imageFile.type,

                                upsert: true
                            }
                        );


                if (uploadError) {

                    console.error(
                        "アイコンアップロードエラー:",
                        uploadError
                    );


                    alert(
                        "アイコン画像のアップロードに失敗しました。\n\n" +
                        uploadError.message
                    );


                    submitButton.disabled = false;

                    submitButton.textContent =
                        "保存する";

                    return;

                }


                // ==============================
                // 公開URL取得
                // ==============================

                const {
                    data: avatarUrlData
                } =
                    supabaseClient
                        .storage
                        .from("avatars")
                        .getPublicUrl(
                            filePath
                        );


                avatarUrl =
                    avatarUrlData.publicUrl;

            }


            // ==============================
            // profilesを更新
            // ==============================

           const {
    data: savedProfile,
    error: updateError
} =
    await supabaseClient
        .from("profiles")
        .upsert(
            {

                id: user.id,

                nickname: nickname,

                avatar_url: avatarUrl

            },
            {
                onConflict: "id"
            }
        )
        .select()
        .single();


            if (updateError) {

                console.error(
                    "プロフィール更新エラー:",
                    updateError
                );


                alert(
                    "プロフィールの保存に失敗しました。\n\n" +
                    updateError.message
                );


                submitButton.disabled = false;

                submitButton.textContent =
                    "保存する";

                return;

            }


            // ==============================
            // 保存成功
            // ==============================

            alert(
                "プロフィールを保存しました！"
            );


            window.location.href =
                "mypage.html";

        }
    );

}
