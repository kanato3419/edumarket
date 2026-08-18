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

        return [];

    }

    return data || [];

}


// ==============================
// 教材一覧を表示
// ==============================

async function displayMaterials(category = "all") {

    const materialList =
        document.getElementById("material-list");

    if (!materialList) {
        return;
    }

    // 読み込み中
    materialList.innerHTML = `
        <p>教材を読み込んでいます...</p>
    `;

    // Supabaseから教材を取得
    const materials = await getMaterials();

    materialList.innerHTML = "";

    if (!materials || materials.length === 0) {

        materialList.innerHTML = `
            <p>現在、教材はありません。</p>
        `;

        return;
    }

    materials.forEach(function(material) {

        if (
            category !== "all" &&
            material.category !== category
        ) {
            return;
        }

        const card =
            document.createElement("div");

        card.className = "material-card";

        card.innerHTML = `

            <p>${material.category}</p>

            <h3>${material.title}</h3>

            <p>${material.description}</p>

            <p>
                対象：${material.target}
            </p>

            <p>
                ¥${Number(material.price).toLocaleString()}
            </p>

            <a
                href="material.html?id=${material.id}"
                class="detail-button"
            >
                詳細を見る
            </a>

        `;

        materialList.appendChild(card);

    });
}


// ==============================
// カテゴリー検索
// ==============================

function filterMaterials(category) {

    displayMaterials(category);

}


// ==============================
// 教材出品（Supabase + PDF Storage版）
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
                document.getElementById(
                    "title"
                ).value.trim();


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
                ).value.trim();


            const price =
                document.getElementById(
                    "price"
                ).value;


            // ==============================
            // PDFファイルを取得
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


            // PDFか確認
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
            // ログインユーザーを取得
            // ==============================

            const {
                data: {
                    user
                },
                error: userError
            } =
                await supabaseClient.auth.getUser();


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


            // ログインしていない場合
            if (!user) {

                alert(
                    "教材を出品するにはログインしてください。"
                );

                window.location.href =
                    "login.html";

                return;
            }


            // ==============================
            // ファイルの保存場所を作る
            // ==============================

            const safeFileName =
    "material_" +
    Date.now() +
    ".pdf";

const filePath =
    user.id +
    "/" +
    safeFileName;
            


            console.log(
                "PDF保存先:",
                filePath
            );


            // ==============================
            // PDFをStorageへアップロード
            // ==============================

            const {
                data: uploadData,
                error: uploadError
            } =
                await supabaseClient
                    .storage
                    .from("materials")
                    .upload(
                        filePath,
                        file,
                        {
                            contentType:
                                "application/pdf",

                            upsert: false
                        }
                    );


            // PDFアップロードエラー
            if (uploadError) {

                console.error(
                    "PDFアップロードエラー:",
                    uploadError
                );

                alert(
                    "PDFのアップロードに失敗しました。\n\n" +
                    uploadError.message
                );

                return;
            }


            console.log(
                "PDFアップロード成功:",
                uploadData
            );


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

                file_path: filePath,

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


            // データベース登録エラー
            if (error) {

                console.error(
                    "教材登録エラー:",
                    error
                );


                // DB登録に失敗した場合、
                // 先ほどアップロードしたPDFを削除
                await supabaseClient
                    .storage
                    .from("materials")
                    .remove([
                        filePath
                    ]);


                alert(
                    "教材情報の登録に失敗しました。\n\n" +
                    error.message
                );

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

    // URLから教材IDを取得
    const params =
        new URLSearchParams(window.location.search);

    const id =
        params.get("id");

    if (!id) {

        detailArea.innerHTML = `
            <h2>教材が見つかりません</h2>
            <p>教材IDが指定されていません。</p>
        `;

        return;
    }


    // まず初期教材・自分が保存した教材を確認
    const defaultList =
        typeof defaultMaterials !== "undefined"
            ? defaultMaterials
            : [];

    const savedMaterials =
        JSON.parse(
            localStorage.getItem("materials")
        ) || [];


    let material =
        [...defaultList, ...savedMaterials]
            .find(function(item) {

                return item.id === id;

            });


    // 見つからなければSupabaseから取得
    if (!material) {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("materials")
                .select("*")
                .eq("id", id)
                .single();


        if (error) {

            console.error(
                "教材取得エラー:",
                error
            );

            detailArea.innerHTML = `
                <h2>教材を読み込めませんでした</h2>
                <p>
                    教材情報の取得中にエラーが発生しました。
                </p>
            `;

            return;
        }


        material = data;
    }


    // 教材が存在しない場合
    if (!material) {

        detailArea.innerHTML = `
            <h2>教材が見つかりません</h2>
            <p>
                指定された教材は存在しません。
            </p>
        `;

        return;
    }


    // ==============================
    // 教材詳細を表示
    // ==============================

    detailArea.innerHTML = `

        <p class="material-category">
            ${material.category || ""}
            /
            ${material.target || ""}
        </p>


        <h2>
            ${material.title || ""}
        </h2>


        <p class="rating">
            ★★★★★ 4.8
        </p>


        <div class="detail-box">

            <h3>この教材について</h3>

            <p>
                ${material.description || ""}
            </p>

        </div>


        <div class="detail-box">

            <h3>教材情報</h3>

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


            ${
                material.fileName
                ? `
                    <p>
                        ファイル：
                        ${material.fileName}
                    </p>
                `
                : ""
            }

        </div>


        <div class="purchase-box">

            <p>価格</p>


            <h2>
                ¥${Number(
                    material.price || 0
                ).toLocaleString()}
            </h2>


            <button
                class="purchase-button"
                onclick="purchaseMaterial('${material.id}')"
            >
                購入する
            </button>

        </div>

    `;
}


// 教材詳細を実行
displayMaterialDetail();

// ==============================
// ページ読み込み時の処理
// ==============================

displayMaterials();

displayMaterialDetail();
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

            // 入力された情報を取得
            const name =
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


            // ボタンを取得
            const submitButton =
                registerForm.querySelector(
                    ".submit-button"
                );


            // ボタンを一時的に無効化
            submitButton.disabled = true;
            submitButton.textContent =
                "登録しています...";


            // Supabaseでアカウント作成
            const { data, error } =
                await supabaseClient.auth.signUp({

                    email: email,

                    password: password,

                    options: {
                        data: {
                            name: name
                        }
                    }

                });


            // エラーが発生した場合
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


            // 登録成功
            console.log(
                "会員登録成功:",
                data
            );


            // メール確認が必要な場合
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


            // すぐログインできる設定の場合
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
// Supabase版
// ==============================

async function displayMyMaterials() {

    const myMaterialsArea =
        document.getElementById("my-materials");


    if (!myMaterialsArea) {
        return;
    }


    // 現在ログインしているユーザーを取得
    const {
        data: {
            user
        },
        error: userError
    } = await supabaseClient.auth.getUser();


    // ユーザー取得エラー
    if (userError) {

        console.error(
            "ユーザー取得エラー:",
            userError
        );

        return;
    }


    // ログインしていない場合
    if (!user) {

        myMaterialsArea.innerHTML = `

            <h3>あなたが出品した教材</h3>

            <p>
                教材を出品するにはログインしてください。
            </p>

        `;

        return;
    }


    // Supabaseから自分の教材だけ取得
    const {
        data: myMaterials,
        error
    } = await supabaseClient
        .from("materials")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", {
            ascending: false
        });


    // 教材取得エラー
    if (error) {

        console.error(
            "教材取得エラー:",
            error
        );

        myMaterialsArea.innerHTML = `

            <h3>あなたが出品した教材</h3>

            <p>
                教材を読み込めませんでした。
            </p>

        `;

        return;
    }


    // 教材がない場合
    if (
        !myMaterials ||
        myMaterials.length === 0
    ) {

        myMaterialsArea.innerHTML = `

            <h3>あなたが出品した教材</h3>

            <p>
                まだ教材を出品していません。
            </p>

        `;

        return;
    }


    // 見出し
    myMaterialsArea.innerHTML = `

        <h3>あなたが出品した教材</h3>

    `;


    // 教材を1つずつ表示
    myMaterials.forEach(function(material) {

        const card =
            document.createElement("div");


        card.className =
            "material-card";


        card.innerHTML = `

            <p>
                ${material.category}
            </p>

            <h3>
                ${material.title}
            </h3>

            <p>
                ¥${Number(
                    material.price
                ).toLocaleString()}
            </p>

            <a
                href="material.html?id=${material.id}"
                class="detail-button"
            >
                詳細を見る
            </a>

        `;


        myMaterialsArea.appendChild(card);

    });

}


displayMyMaterials();
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
// 購入した教材を表示（Supabase版）
// ==============================

async function displayPurchasedMaterials() {

    const purchasedArea =
        document.getElementById(
            "purchased-material-list"
        );

    if (!purchasedArea) {
        return;
    }


    // ログイン中のユーザーを取得
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

        purchasedArea.innerHTML = `
            <p>
                ユーザー情報を取得できませんでした。
            </p>
        `;

        return;
    }


    // ログインしていない
    if (!user) {

        purchasedArea.innerHTML = `
            <p>
                ログインすると購入履歴を確認できます。
            </p>
        `;

        return;
    }


    // 読み込み中
    purchasedArea.innerHTML = `
        <p>
            購入履歴を読み込んでいます...
        </p>
    `;


    // ==============================
    // 購入履歴を取得
    // ==============================

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


    // エラー
    if (purchaseError) {

        console.error(
            "購入履歴取得エラー:",
            purchaseError
        );

        purchasedArea.innerHTML = `
            <p>
                購入履歴を取得できませんでした。
            </p>
        `;

        return;
    }


    // 購入履歴がない
    if (
        !purchases ||
        purchases.length === 0
    ) {

        purchasedArea.innerHTML = `
            <p>
                まだ購入した教材はありません。
            </p>
        `;

        return;
    }


    // 一覧を空にする
    purchasedArea.innerHTML = "";


    // ==============================
    // 教材カードを作成
    // ==============================

    purchases.forEach(
        function(purchase) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "material-card";


            const material =
                purchase.materials;


            card.innerHTML = `

                <p>
                    ${material?.category || ""}
                </p>


                <h3>
                    ${material?.title || "教材"}
                </h3>


                <p>
                    ${material?.description || ""}
                </p>


                <p>
                    購入価格：
                    ¥${Number(
                        purchase.price
                    ).toLocaleString()}
                </p>


                <a
                    href="material.html?id=${purchase.material_id}"
                    class="detail-button"
                >
                    教材を見る
                </a>


                <button
                    class="detail-button"
                    onclick="openPurchasedPDF('${purchase.material_id}')"
                >
                    PDFを見る
                </button>

            `;


            purchasedArea.appendChild(
                card
            );

        }
    );

}


// 実行
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
            "material-card";


        card.innerHTML = `

            <p>
                ${material.category}
            </p>


            <h3>
                ${material.title}
            </h3>


            <p>
                ${material.description}
            </p>


            <p>
                対象：
                ${material.target}
            </p>


            <p>
                価格：
                ¥${Number(
                    material.price
                ).toLocaleString()}
            </p>


            <a
                href="material.html?id=${material.id}"
                class="detail-button"
            >
                詳細を見る
            </a>


            <a
                href="edit-material.html?id=${material.id}"
                class="detail-button"
            >
                編集する
            </a>
<button
    class="detail-button"
    onclick="deleteMaterial('${material.id}')"
>
    削除する
</button>
        `;


        myMaterialsArea.appendChild(card);

    });

}


// 実行
displayMyMaterials();
// ==============================
// 教材編集画面
// ==============================

async function loadEditMaterial() {

    const form =
        document.getElementById("edit-material-form");

    if (!form) {
        return;
    }


    // URLから教材IDを取得
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

        window.location.href =
            "mypage.html";

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


    if (userError || !user) {

        alert(
            "ログインしてください。"
        );

        window.location.href =
            "login.html";

        return;
    }


    // 教材を取得
    const {
        data: material,
        error: materialError
    } =
        await supabaseClient
            .from("materials")
            .select("*")
            .eq("id", materialId)
            .single();


    if (materialError || !material) {

        console.error(
            "教材取得エラー:",
            materialError
        );

        alert(
            "教材を取得できませんでした。"
        );

        window.location.href =
            "mypage.html";

        return;
    }


    // ==============================
    // 自分の教材か確認
    // ==============================

    if (material.seller_id !== user.id) {

        alert(
            "この教材を編集する権限がありません。"
        );

        window.location.href =
            "mypage.html";

        return;
    }


    // ==============================
    // 現在の情報をフォームに入れる
    // ==============================

    document.getElementById("title").value =
        material.title || "";


    document.getElementById("category").value =
        material.category || "";


    document.getElementById("target").value =
        material.target || "";


    document.getElementById("description").value =
        material.description || "";


    document.getElementById("price").value =
        material.price || "";

}


// 編集画面で実行
loadEditMaterial();
// ==============================
// 教材情報を編集して保存
// ==============================

const editForm =
    document.getElementById("edit-material-form");

if (editForm) {

    editForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            // URLから教材IDを取得
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

                window.location.href =
                    "login.html";

                return;
            }


            // フォームの値を取得
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
            // Supabaseの教材情報を更新
            // ==============================

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("materials")
                    .update({

                        title: title,

                        category: category,

                        target: target,

                        description: description,

                        price: price

                    })
                    .eq(
                        "id",
                        materialId
                    )
                    .eq(
                        "seller_id",
                        user.id
                    )
                    .select()
                    .single();


            // 更新エラー
            if (error) {

                console.error(
                    "教材更新エラー:",
                    error
                );

                alert(
                    "教材の更新に失敗しました。\n\n" +
                    error.message
                );

                return;
            }


            // 更新成功
            console.log(
                "教材更新成功:",
                data
            );


            alert(
                "教材情報を更新しました！"
            );


            // マイページへ戻る
            window.location.href =
                "mypage.html";

        }
    );

}
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
